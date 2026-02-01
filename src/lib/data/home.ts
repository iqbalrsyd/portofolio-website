import BaseData from './base';
import { getSkills } from './skills';
import type { Skill } from './types';

const title = 'Home';

const hero: {
	title: string;
	description: string;
	links: Array<{ label: string; href: string; icon: `i-carbon-${string}` }>;
} = {
	title: `${BaseData.fullName},`,
	description:
		'Backend Engineer with strong focus on building and improving reliable systems using Golang. Experienced in optimizing backend services, implementing automation, and enhancing system reliability through clean architecture and observability-driven development.',
	links: [
		{ label: 'GitHub', href: 'https://github.com', icon: 'i-carbon-logo-github' },
		{ label: 'LinkedIn', href: 'https://linkedin.com', icon: 'i-carbon-logo-linkedin' },
		{ label: 'Email', href: 'mailto:rasyad3003@gmail.com', icon: 'i-carbon-at' },
		{ label: 'Phone', href: 'tel:+62877800140330', icon: 'i-carbon-phone' }
	]
};

const carousel: Array<Skill> = getSkills();

const HomeData = {
	title,
	hero,
	carousel
};

export default HomeData;
