import { storage } from "../storage";
import type { Profile } from "@shared/schema";

export interface MentorMatch {
  mentor: any;
  score: number;
  scoreBreakdown: {
    industryMatches: number;
    skillMatches: number;
    languageMatches: number;
    availabilityBonus: number;
  };
}

export async function matchMentors(menteeProfile: Profile): Promise<MentorMatch[]> {
  const mentors = await storage.getMentors();
  
  const matches = mentors.map(mentor => {
    const scoreBreakdown = {
      industryMatches: 0,
      skillMatches: 0,
      languageMatches: 0,
      availabilityBonus: 0,
    };

    // Calculate industry matches (+3 points each)
    if (menteeProfile.industries && mentor.profile?.industries) {
      const industryOverlap = menteeProfile.industries.filter(industry =>
        mentor.profile.industries?.includes(industry)
      );
      scoreBreakdown.industryMatches = industryOverlap.length * 3;
    }

    // Calculate skill matches (+2 points each)
    if (menteeProfile.skills && mentor.profile?.skills) {
      const skillOverlap = menteeProfile.skills.filter(skill =>
        mentor.profile.skills?.some(mentorSkill =>
          mentorSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(mentorSkill.toLowerCase())
        )
      );
      scoreBreakdown.skillMatches = skillOverlap.length * 2;
    }

    // Calculate language matches (+1 point each)
    if (menteeProfile.languages && mentor.profile?.languages) {
      const languageOverlap = menteeProfile.languages.filter(language =>
        mentor.profile.languages?.includes(language)
      );
      scoreBreakdown.languageMatches = languageOverlap.length * 1;
    }

    // Availability bonus (+2 points if available in next 7 days)
    // This is simplified - in a real app, you'd check actual availability
    if (mentor.profile?.availability) {
      scoreBreakdown.availabilityBonus = 2;
    }

    const totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);

    return {
      mentor,
      score: totalScore,
      scoreBreakdown,
    };
  });

  // Sort by score and return top 5
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
