<script lang="ts">
	import Title from '$lib/components/common/title/title.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import CarouselContent from '$lib/components/ui/carousel/carousel-content.svelte';
	import CarouselItem from '$lib/components/ui/carousel/carousel-item.svelte';
	import CarouselNext from '$lib/components/ui/carousel/carousel-next.svelte';
	import CarouselPrevious from '$lib/components/ui/carousel/carousel-previous.svelte';
	import Carousel from '$lib/components/ui/carousel/carousel.svelte';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import ResponsiveContainer from '$lib/components/ui/responsive-container/responsive-container.svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '$lib/components/ui/tooltip';
	import H1 from '$lib/components/ui/typography/h1.svelte';
	import Muted from '$lib/components/ui/typography/muted.svelte';
	import HomeData from '$lib/data/home';
	import { href } from '$lib/utils';
	import { mode } from 'mode-watcher';
	import { type CarouselAPI } from '$lib/components/ui/carousel/context.js';
	import { onMount } from 'svelte';
	import Education from '$lib/landing/education/+page.svelte';
	import Experience from '$lib/landing/experience/+page.svelte';
	import Skills from '$lib/landing/skills/+page.svelte';
	import Projects from '$lib/landing/projects/+page.svelte';
	import Resume from '$lib/landing/resume/+page.svelte';

	let api: CarouselAPI;

	onMount(() => {
		setInterval(() => {
			if (!api) return;

			api.scrollNext();
		}, 2000);
	});
	
</script>

<Title title={HomeData.title} />
<ResponsiveContainer className="flex flex-col justify-center flex-1 z-20">
	<div
		class="flex flex-1 flex-col items-center justify-center gap-8 px-14 md:flex-row md:justify-between"
	>
		<div
			class="flex flex-col items-center justify-center gap-4 text-center md:items-start md:text-left"
		>
			<H1>{HomeData.hero.title}</H1>
			<Muted>{HomeData.hero.description}</Muted>
			<div class="flex flex-row gap-1">
				{#each HomeData.hero.links as item}
					<a href={item.href} target="_blank">
						<Tooltip>
							<TooltipTrigger>
								<Button variant="outline" size="icon">
									<Icon icon={item.icon} className="text-lg" />
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">{item.label}</TooltipContent>
						</Tooltip>
					</a>
				{/each}
			</div>
		</div>
		<div>
			<Carousel bind:api class="w-[200px] md:ml-14" opts={{ loop: true }}>
				<CarouselContent>
					{#each HomeData.carousel as item}
						<CarouselItem class="flex flex-col items-center justify-center gap-4">
							<img
								src={$mode === 'dark' ? item.logo.dark : item.logo.light}
								class="h-[150px] w-[150px]"
								alt={item.name}
							/>
							<a href={href(`/skills/${item.slug}`)}>
								<Button variant="ghost">
									{item.name}
								</Button>
							</a>
						</CarouselItem>
					{/each}
				</CarouselContent>
				<CarouselNext />
				<CarouselPrevious />
			</Carousel>
		</div>
	</div>
	
	<!-- Sections dengan ID untuk smooth scroll -->
	<div id="education" class="w-full pt-16">
		<Education />
	</div>
	
	<div id="experience" class="w-full pt-16">
		<Experience />
	</div>
	
	<div id="skills" class="w-full pt-16">
		<Skills />
	</div>
	
	<div id="projects" class="w-full pt-16">
		<Projects />
	</div>
	
	<div id="resume" class="w-full pt-16">
		<Resume />
	</div>
</ResponsiveContainer>
