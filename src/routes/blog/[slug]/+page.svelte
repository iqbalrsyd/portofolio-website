<script lang="ts">
	import BasePage from '$lib/components/common/base-page/base-page.svelte';
	import EmptyResult from '$lib/components/common/empty-result/empty-result.svelte';
	import FancyBanner from '$lib/components/common/fancy-banner/fancy-banner.svelte';
	import EmptyMarkdown from '$lib/components/common/markdown/empty-markdown.svelte';
	import Markdown from '$lib/components/common/markdown/markdown.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import H1 from '$lib/components/ui/typography/h1.svelte';
	import Muted from '$lib/components/ui/typography/muted.svelte';
	import Assets from '$lib/data/assets';
	import type { BlogPost } from '$lib/data/types';
	import { getMonthAndYear } from '$lib/utils';
	import { mode } from 'mode-watcher';

	let { data }: { data: { item?: BlogPost } } = $props();

	let title = $derived(`${data?.item?.title ?? 'Not Found'} - Blog`);
	let banner = $derived(
		($mode == 'dark' ? data?.item?.cover.dark : data.item?.cover.light) ?? Assets.Unknown.light
	);

	let publishedDate = $derived(getMonthAndYear(data.item?.publishedAt));
</script>

<BasePage {title}>
	{#if !data.item}
		<EmptyResult />
	{:else}
		<FancyBanner img={banner}>
			<div class="flex w-full flex-col items-center justify-center gap-4">
				<H1>{data.item.title}</H1>
				<Badge variant="secondary" class="text-base">{data.item.category}</Badge>
				<Muted class="text-sm">{publishedDate} · by {data.item.author}</Muted>
				<Muted class="max-w-2xl text-center">{data.item.shortDescription}</Muted>
				<Separator />
				<div class="flex flex-row flex-wrap justify-center gap-2">
					{#each data.item.tags as tag}
						<Badge variant="outline">{tag}</Badge>
					{/each}
				</div>
			</div>
		</FancyBanner>
		<Separator />
		{#if data.item.description.trim()}
			<Markdown content={data.item.description} />
		{:else}
			<EmptyMarkdown />
		{/if}
	{/if}
</BasePage>
