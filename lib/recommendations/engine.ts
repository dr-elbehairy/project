import type { GapItem, Recommendation, SkillCluster, Skill } from '@/types/database';

interface RecommendationInput {
  analysisId: string;
  gaps: GapItem[];
  skills: Skill[];
  waiScore: number;
}

const CERTIFICATION_MAP: Record<string, { name: string; provider: string; skills: string[] }[]> = {
  market_skills: [
    { name: 'AWS Solutions Architect', provider: 'AWS', skills: ['cloud computing', 'aws', 'cloud architecture', 'infrastructure'] },
    { name: 'Google Cloud Professional', provider: 'Google', skills: ['cloud computing', 'google cloud', 'gcp', 'machine learning'] },
    { name: 'Azure Administrator', provider: 'Microsoft', skills: ['cloud computing', 'azure', 'microsoft cloud'] },
    { name: 'CCNA', provider: 'Cisco', skills: ['networking', 'network security', 'cisco', 'routing'] },
    { name: 'CompTIA Security+', provider: 'CompTIA', skills: ['cybersecurity', 'security', 'information security'] },
    { name: 'CompTIA A+', provider: 'CompTIA', skills: ['hardware', 'troubleshooting', 'technical support'] },
  ],
  core_academic: [
    { name: 'ISACA CISA', provider: 'ISACA', skills: ['auditing', 'information systems', 'governance'] },
    { name: 'ISACA CRISC', provider: 'ISACA', skills: ['risk management', 'it risk', 'control'] },
    { name: 'CompTIA Network+', provider: 'CompTIA', skills: ['networking', 'network fundamentals'] },
  ],
  future_skills: [
    { name: 'Google TensorFlow Developer', provider: 'Google', skills: ['machine learning', 'deep learning', 'ai', 'tensorflow'] },
    { name: 'AWS Machine Learning Specialty', provider: 'AWS', skills: ['machine learning', 'ai', 'data science'] },
    { name: 'Microsoft AI Engineer', provider: 'Microsoft', skills: ['artificial intelligence', 'ai', 'cognitive services'] },
  ],
  soft_skills: [
    { name: 'PMP', provider: 'PMI', skills: ['project management', 'leadership', 'team management'] },
    { name: 'PMI-ACP', provider: 'PMI', skills: ['agile', 'scrum', 'project management'] },
    { name: 'CAPM', provider: 'PMI', skills: ['project management', 'planning'] },
  ],
};

export function generateRecommendations(input: RecommendationInput): Omit<Recommendation, 'id' | 'created_at'>[] {
  const { analysisId, gaps, skills, waiScore } = input;
  const recommendations: Omit<Recommendation, 'id' | 'created_at'>[] = [];

  const missingSkillGaps = gaps.filter(g => g.coverage < 10);
  for (const gap of missingSkillGaps.slice(0, 5)) {
    recommendations.push({
      analysis_id: analysisId,
      type: 'missing_skill',
      title: `Add coverage for: ${gap.skill_name}`,
      title_ar: `إضافة تغطية لمهارة: ${gap.skill_name}`,
      description: `This skill has ${gap.coverage}% coverage but the benchmark expects ${gap.benchmark_expected}%. Consider adding dedicated course content or integrating it into existing courses.`,
      priority: gap.gap > 50 ? 'critical' : 'high',
      linked_skill_ids: [gap.skill_id],
    });
  }

  const lowCoverageGaps = gaps.filter(g => g.coverage >= 10 && g.coverage < 40);
  for (const gap of lowCoverageGaps.slice(0, 5)) {
    recommendations.push({
      analysis_id: analysisId,
      type: 'micro_module',
      title: `Micro-module: ${gap.skill_name} Enhancement`,
      title_ar: `وحدة قصيرة: تعزيز ${gap.skill_name}`,
      description: `Create a focused micro-module (2-4 weeks) to strengthen coverage of ${gap.skill_name}. Current coverage: ${gap.coverage}%, target: ${gap.benchmark_expected}%.`,
      priority: gap.gap > 30 ? 'high' : 'medium',
      linked_skill_ids: [gap.skill_id],
    });
  }

  const gapsByCluster = groupGapsByCluster(gaps);
  for (const [cluster, clusterGaps] of Object.entries(gapsByCluster)) {
    const certifications = CERTIFICATION_MAP[cluster] || [];
    for (const cert of certifications) {
      const relatedGaps = clusterGaps.filter(g => {
        const skill = skills.find(s => s.id === g.skill_id);
        if (!skill) return false;
        const skillKeywords = [...skill.keywords, skill.name.toLowerCase()];
        return cert.skills.some(cs =>
          skillKeywords.some(sk => sk.toLowerCase().includes(cs) || cs.includes(sk.toLowerCase()))
        );
      });

      if (relatedGaps.length > 0) {
        recommendations.push({
          analysis_id: analysisId,
          type: 'certification',
          title: `Professional Certification: ${cert.name} (${cert.provider})`,
          title_ar: `شهادة مهنية: ${cert.name} (${cert.provider})`,
          description: `Students completing this program could benefit from ${cert.name} certification by ${cert.provider}, which covers ${relatedGaps.length} identified skill gaps.`,
          priority: 'medium',
          linked_skill_ids: relatedGaps.map(g => g.skill_id),
        });
      }
    }
  }

  if (waiScore < 50) {
    recommendations.push({
      analysis_id: analysisId,
      type: 'curriculum_change',
      title: 'Major Curriculum Restructuring Recommended',
      title_ar: 'يُوصى بإعادة هيكلة المنهج بشكل جذري',
      description: `The WAI score of ${waiScore} indicates significant misalignment with market needs. A comprehensive curriculum review involving industry stakeholders is recommended.`,
      priority: 'critical',
      linked_skill_ids: gaps.slice(0, 5).map(g => g.skill_id),
    });
  } else if (waiScore < 70) {
    recommendations.push({
      analysis_id: analysisId,
      type: 'curriculum_change',
      title: 'Targeted Curriculum Updates Needed',
      title_ar: 'تحديثات مستهدفة مطلوبة في المنهج',
      description: `The WAI score of ${waiScore} suggests moderate alignment gaps. Focus on the top ${Math.min(gaps.length, 5)} skill gaps to improve the score significantly.`,
      priority: 'high',
      linked_skill_ids: gaps.slice(0, 3).map(g => g.skill_id),
    });
  }

  return recommendations;
}

function groupGapsByCluster(gaps: GapItem[]): Record<string, GapItem[]> {
  const grouped: Record<string, GapItem[]> = {};
  for (const gap of gaps) {
    if (!grouped[gap.cluster]) {
      grouped[gap.cluster] = [];
    }
    grouped[gap.cluster].push(gap);
  }
  return grouped;
}
