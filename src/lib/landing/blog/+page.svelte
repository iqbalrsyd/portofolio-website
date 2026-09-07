<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import FancyCard from '$lib/components/ui/card/fancy-card.svelte';
	import H2 from '$lib/components/ui/typography/h2.svelte';
	import Muted from '$lib/components/ui/typography/muted.svelte';
	import BlogData from '$lib/data/blog';
	import { getMonthAndYear, href } from '$lib/utils';

	const latestArticles = [...BlogData.items]
		.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
		.slice(0, 3);
</script>

<section class="flex flex-col gap-8">
	<div class="flex flex-col gap-2">
		<H2>Latest Articles</H2>
		<Muted>Notes on backend engineering, system design, and DevOps.</Muted>
	</div>

	<div class="flex flex-col gap-4">
		{#each latestArticles as article (article.slug)}
			<FancyCard
				color="#6366f1"
				tilt={2}
				href={href(`/blog/${article.slug}`)}
				class="group"
			>
				<article class="flex flex-col gap-4 p-5 sm:p-6">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<Badge variant="outline">{article.category}</Badge>
						<Muted>{getMonthAndYear(article.publishedAt)}</Muted>
					</div>

					<div class="flex flex-col gap-2">
						<h3 class="text-lg font-semibold tracking-tight sm:text-xl">{article.title}</h3>
						<Muted>{article.shortDescription}</Muted>
					</div>

					<div class="flex flex-wrap items-center justify-between gap-4">
						<div class="flex flex-wrap gap-2">
							{#each article.tags.slice(0, 3) as tag (tag)}
								<Badge variant="secondary">{tag}</Badge>
							{/each}
						</div>
						<span class="text-sm font-medium transition-transform group-hover:translate-x-1">
							Read article →
						</span>
					</div>
				</article>
			</FancyCard>
		{/each}
	</div>

	<div>
		<a href={href('/blog')}>
			<Button variant="outline">View all articles →</Button>
		</a>
	</div>
</section>
