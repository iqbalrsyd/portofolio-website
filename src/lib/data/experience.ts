import Assets from './assets';
import { getSkills } from './skills';
import { ContractType, type Experience } from './types';

const title = 'Experience';

const items: Array<Experience> = [
	{
		slug: 'brins-intern',
		company: 'PT BRI Asuransi Indonesia (BRINS)',
		description: `Developed backend REST APIs using C# (.NET) with ASP.NET Core by applying OOP and SOLID principles. 
		
Contributed to backend development using PHP (Lumen) for system monitoring applications.

Implemented frontend features using Angular and TypeScript.

Participated in UI/UX design using Figma.`,
		contract: ContractType.Internship,
		type: 'Software Development',
		location: 'South Jakarta',
		period: { from: new Date(2025, 0, 1), to: new Date(2025, 1, 28) },
		skills: getSkills('csharp', 'dotnet', 'php', 'angular', 'typescript', 'figma'),
		name: 'Software Developer Intern',
		color: 'blue',
		links: [],
		logo: Assets.Unknown,
		shortDescription: 'Developed backend REST APIs using C# (.NET) and PHP, implemented frontend features using Angular.'
	},
	{
		slug: 'calculus-ta',
		company: 'DTETI FT UGM',
		description: `Assisted students in understanding single and multivariable calculus concepts through guided discussions and tutorial sessions.

Conducted tutorials for approximately 30 students per class, twice per week.

Provided mentorship in mathematical problem-solving and conceptual understanding.`,
		contract: ContractType.PartTime,
		type: 'Teaching',
		location: 'Yogyakarta',
		period: { from: new Date(2023, 7, 1), to: new Date(2024, 11, 31) },
		skills: getSkills(),
		name: 'Tutorial Assistant - Calculus',
		color: 'green',
		links: [],
		logo: Assets.Unknown,
		shortDescription: 'Assisted students in calculus concepts through guided discussions for ~30 students per class.'
	},
	{
		slug: 'basic-science-ta',
		company: 'DTETI FT UGM',
		description: `Assisted students in basic science experiments for approximately 50 students per session.

Utilized Python-based software and relevant hardware tools for laboratory demonstrations.

Guided students through experimental procedures and data analysis.`,
		contract: ContractType.PartTime,
		type: 'Teaching',
		location: 'Yogyakarta',
		period: { from: new Date(2023, 7, 1), to: new Date(2024, 11, 31) },
		skills: getSkills('python'),
		name: 'Basic Science Practicum Assistant',
		color: 'purple',
		links: [],
		logo: Assets.Unknown,
		shortDescription: 'Assisted students in basic science experiments using Python-based software for ~50 students per session.'
	}
];

const ExperienceData = { title, items };

export default ExperienceData;
