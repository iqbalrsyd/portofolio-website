import type { Skill, SkillCategory } from './types';
import type { StringWithAutoComplete } from '@riadh-adrani/utils';
import { omit } from '@riadh-adrani/utils';
import Assets from './assets';
import svelteMd from './md/svelte.md?raw';

const defineSkillCategory = <S extends string>(data: SkillCategory<S>): SkillCategory<S> => data;

const categories = [
	defineSkillCategory({ name: 'Programming Languages', slug: 'pro-lang' }),
	defineSkillCategory({ name: 'Frameworks', slug: 'framework' }),
	defineSkillCategory({ name: 'Libraries', slug: 'library' }),
	defineSkillCategory({ name: 'Langauges', slug: 'lang' }),
	defineSkillCategory({ name: 'Databases', slug: 'db' }),
	defineSkillCategory({ name: 'ORMs', slug: 'orm' }),
	defineSkillCategory({ name: 'DevOps', slug: 'devops' }),
	defineSkillCategory({ name: 'Testing', slug: 'test' }),
	defineSkillCategory({ name: 'Dev Tools', slug: 'devtools' }),
	defineSkillCategory({ name: 'Markup & Style', slug: 'markup-style' }),
	defineSkillCategory({ name: 'Design', slug: 'design' }),
	defineSkillCategory({ name: 'Soft Skills', slug: 'soft' })
] as const;

const defineSkill = <S extends string>(
	skill: Omit<Skill<S>, 'category'> & {
		category?: StringWithAutoComplete<(typeof categories)[number]['slug']>;
	}
): Skill<S> => {
	const out: Skill<S> = omit(skill, 'category');

	if (skill.category) {
		out.category = categories.find((it) => it.slug === skill.category);
	}

	return out;
};

export const getSkills = (
	...slugs: Array<StringWithAutoComplete<(typeof items)[number]['slug']>>
): Array<Skill> => {
	return items.filter((it) => (slugs.length === 0 ? true : slugs.includes(it.slug)));
};

export const groupByCategory = (
	query: string
): Array<{ category: SkillCategory; items: Array<Skill> }> => {
	const out: ReturnType<typeof groupByCategory> = [];

	const others: Array<Skill> = [];

	items.forEach((item) => {
		if (query.trim() && !item.name.toLowerCase().includes(query.trim().toLowerCase())) return;

		// push to others if item does not have a category
		if (!item.category) {
			others.push(item);
			return;
		}

		// check if category exists
		let category = out.find((it) => it.category.slug === item.category?.slug);

		if (!category) {
			category = { items: [], category: item.category };

			out.push(category);
		}

		category.items.push(item);
	});

	if (others.length !== 0) {
		out.push({ category: { name: 'Others', slug: 'others' }, items: others });
	}

	return out;
};

const title = 'Skills';

const items = [
	defineSkill({
		slug: 'golang',
		color: 'cyan',
		description: 'Primary backend programming language with strong focus on building reliable and scalable systems.',
		logo: Assets.Go,
		name: 'Golang',
		category: 'pro-lang'
	}),
	defineSkill({
		slug: 'ts',
		color: 'blue',
		description: 'Used for full-stack development, particularly in frontend applications and backend services.',
		logo: Assets.TypeScript,
		name: 'TypeScript',
		category: 'pro-lang'
	}),
	defineSkill({
		slug: 'csharp',
		color: 'purple',
		description: 'Used for backend REST API development with ASP.NET Core, applying OOP and SOLID principles.',
		logo: Assets.Csharp,
		name: 'C#',
		category: 'pro-lang'
	}),
	defineSkill({
		slug: 'dotnet',
		color: 'purple',
		description: '.NET framework for building enterprise backend applications with ASP.NET Core.',
		logo: Assets.Dotnet,
		name: '.NET',
		category: 'framework'
	}),
	defineSkill({
		slug: 'reactjs',
		color: 'cyan',
		description: 'Frontend library for building interactive user interfaces and web-based dashboards.',
		logo: Assets.ReactJs,
		name: 'React',
		category: 'library'
	}),
	defineSkill({
		slug: 'expressjs',
		color: 'green',
		description: 'Node.js framework for building REST APIs and backend services.',
		logo: Assets.ExpressJs,
		name: 'Express.js',
		category: 'framework'
	}),
	defineSkill({
		slug: 'docker',
		color: 'blue',
		description: 'Containerization platform for deployment and development environment consistency.',
		logo: Assets.Docker,
		name: 'Docker',
		category: 'devops'
	}),
	defineSkill({
		slug: 'kubernetes',
		color: 'blue',
		description: 'Container orchestration for staging deployments and microservices management.',
		logo: Assets.Kubernetes,
		name: 'Kubernetes',
		category: 'devops'
	}),
	defineSkill({
		slug: 'kafka',
		color: 'black',
		description: 'Event streaming platform for building event-driven architectures and asynchronous processing.',
		logo: Assets.Kafka,
		name: 'Apache Kafka',
		category: 'devops'
	}),
	defineSkill({
		slug: 'jenkins',
		color: 'red',
		description: 'CI/CD automation server for building and deploying microservices pipelines.',
		logo: Assets.Jenkins,
		name: 'Jenkins',
		category: 'devops'
	}),
	defineSkill({
		slug: 'azure',
		color: 'blue',
		description: 'Cloud platform for deploying and managing applications and services.',
		logo: Assets.Azure,
		name: 'Azure',
		category: 'devops'
	}),
	defineSkill({
		slug: 'prometheus',
		color: 'orange',
		description: 'Monitoring system for collecting metrics and observability of distributed systems.',
		logo: Assets.Prometheus,
		name: 'Prometheus',
		category: 'devops'
	}),
	defineSkill({
		slug: 'grafana',
		color: 'orange',
		description: 'Visualization platform for monitoring dashboards and observability.',
		logo: Assets.Grafana,
		name: 'Grafana',
		category: 'devops'
	}),
	defineSkill({
		slug: 'postgresql',
		color: 'blue',
		description: 'Relational database for data persistence and analytical use cases.',
		logo: Assets.PostgreSQL,
		name: 'PostgreSQL',
		category: 'db'
	}),
	defineSkill({
		slug: 'redis',
		color: 'red',
		description: 'In-memory data store for caching, Pub/Sub messaging, and session management.',
		logo: Assets.Redis,
		name: 'Redis',
		category: 'db'
	}),
	defineSkill({
		slug: 'firebase',
		color: 'yellow',
		description: 'Backend platform for authentication, real-time database, and offline data access.',
		logo: Assets.Firebase,
		name: 'Firebase',
		category: 'db'
	})
] as const;

const SkillsData = {
	title,
	items
};

export default SkillsData;
