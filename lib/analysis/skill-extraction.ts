import type { Course, Skill } from '@/types/database';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text).split(' ').filter(function(t) { return t.length > 2; });
}

export function extractSkillsFromCourse(
  course: Course,
  skills: Skill[]
): { skillId: string; score: number }[] {
  const courseText = normalizeText(
    course.title + ' ' + course.title_ar + ' ' + course.description + ' ' + course.code
  );
  const courseTokens = tokenize(courseText);
  const matches: { skillId: string; score: number }[] = [];

  for (var si = 0; si < skills.length; si++) {
    const skill = skills[si];
    let matchScore = 0;
    const skillKeywords = skill.keywords.map(function(k) { return normalizeText(k); });
    const skillNameTokens = tokenize(skill.name + ' ' + skill.name_ar);
    const allKeywords = skillKeywords.concat(skillNameTokens);

    for (var ki = 0; ki < allKeywords.length; ki++) {
      const kwTokens = tokenize(allKeywords[ki]);
      for (var kwi = 0; kwi < kwTokens.length; kwi++) {
        const kwToken = kwTokens[kwi];
        if (courseText.includes(kwToken)) {
          matchScore += 1;
        }
        for (var cti = 0; cti < courseTokens.length; cti++) {
          const ct = courseTokens[cti];
          if (ct === kwToken) {
            matchScore += 2;
          } else if (ct.includes(kwToken) || kwToken.includes(ct)) {
            matchScore += 0.5;
          }
        }
      }
    }

    if (matchScore > 0) {
      const normalizedScore = Math.min(matchScore / (allKeywords.length * 2), 1.0);
      matches.push({ skillId: skill.id, score: normalizedScore });
    }
  }

  return matches.sort(function(a, b) { return b.score - a.score; });
}

export function buildProgramSkillVector(
  courses: Course[],
  skills: Skill[]
): Record<string, number> {
  const vector: Record<string, number> = {};

  for (var i = 0; i < skills.length; i++) {
    vector[skills[i].id] = 0;
  }

  for (var ci = 0; ci < courses.length; ci++) {
    const course = courses[ci];
    if (!course.is_active) continue;
    const courseSkills = extractSkillsFromCourse(course, skills);
    const creditWeight = course.credits / 3;

    for (var csi = 0; csi < courseSkills.length; csi++) {
      const skillId = courseSkills[csi].skillId;
      const score = courseSkills[csi].score;
      vector[skillId] = Math.min((vector[skillId] || 0) + score * creditWeight, 1.0);
    }
  }

  return vector;
}

function arrayFromSkillIds(extracted: { skillId: string; score: number }[], threshold: number): string[] {
  const result: string[] = [];
  for (var i = 0; i < extracted.length; i++) {
    if (extracted[i].score > threshold) {
      result.push(extracted[i].skillId);
    }
  }
  return result;
}

function countIntersection(arr1: string[], arr2: string[]): number {
  let count = 0;
  const lookup: Record<string, boolean> = {};
  for (var i = 0; i < arr2.length; i++) {
    lookup[arr2[i]] = true;
  }
  for (var j = 0; j < arr1.length; j++) {
    if (lookup[arr1[j]]) count++;
  }
  return count;
}

function countUnion(arr1: string[], arr2: string[]): number {
  const all: Record<string, boolean> = {};
  for (var i = 0; i < arr1.length; i++) all[arr1[i]] = true;
  for (var j = 0; j < arr2.length; j++) all[arr2[j]] = true;
  return Object.keys(all).length;
}

export function detectRedundancy(
  courses: Course[],
  skills: Skill[]
): { course1: string; course2: string; overlap: number }[] {
  const redundancies: { course1: string; course2: string; overlap: number }[] = [];
  const courseSkillArrays: Record<string, string[]> = {};

  for (var ci = 0; ci < courses.length; ci++) {
    const extracted = extractSkillsFromCourse(courses[ci], skills);
    courseSkillArrays[courses[ci].id] = arrayFromSkillIds(extracted, 0.2);
  }

  const activeCourses = courses.filter(function(c) { return c.is_active; });
  for (var i = 0; i < activeCourses.length; i++) {
    for (var j = i + 1; j < activeCourses.length; j++) {
      const skills1 = courseSkillArrays[activeCourses[i].id] || [];
      const skills2 = courseSkillArrays[activeCourses[j].id] || [];

      if (skills1.length === 0 || skills2.length === 0) continue;

      const intersectionCount = countIntersection(skills1, skills2);
      const unionCount = countUnion(skills1, skills2);
      const overlap = unionCount > 0 ? intersectionCount / unionCount : 0;

      const titleSimilarity = computeTitleSimilarity(
        activeCourses[i].title,
        activeCourses[j].title
      );

      const combinedOverlap = overlap * 0.7 + titleSimilarity * 0.3;

      if (combinedOverlap > 0.4) {
        redundancies.push({
          course1: activeCourses[i].id,
          course2: activeCourses[j].id,
          overlap: Math.round(combinedOverlap * 100) / 100,
        });
      }
    }
  }

  return redundancies.sort(function(a, b) { return b.overlap - a.overlap; });
}

function computeTitleSimilarity(title1: string, title2: string): number {
  const tokens1 = tokenize(title1);
  const tokens2 = tokenize(title2);
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  const intersectionCount = countIntersection(tokens1, tokens2);
  const unionCount = countUnion(tokens1, tokens2);
  return unionCount > 0 ? intersectionCount / unionCount : 0;
}
