<script lang="ts">
	import Assets from '$lib/data/assets';
	import type { BlogPost } from '$lib/data/types';
	import { getMonthAndYear, href } from '$lib/utils';
	import { ellipsify } from '@riadh-adrani/utils';
	import { mode } from 'mode-watcher';
	import AvatarFallback from '../ui/avatar/avatar-fallback.svelte';
	import AvatarImage from '../ui/avatar/avatar-image.svelte';
	import Avatar from '../ui/avatar/avatar.svelte';
	import Badge from '../ui/badge/badge.svelte';
	import { CardHeader } from '../ui/card';
	import CardContent from '../ui/card/card-content.svelte';
	import CardFooter from '../ui/card/card-footer.svelte';
	import CardTitle from '../ui/card/card-title.svelte';
	import FancyCard from '../ui/card/fancy-card.svelte';
	import Icon from '../ui/icon/icon.svelte';
	import Separator from '../ui/separator/separator.svelte';
	import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
	import Muted from '../ui/typography/muted.svelte';

	const { post }: { post: BlogPost } = $props();

	let publishedDate = $derived(getMonthAndYear(post.publishedAt));
</script>

<FancyCard
	color="#6366f1"
	class="flex h-full flex-col"
	href={href(`/blog/${post.slug}`)}
>
	<CardHeader class="flex w-full flex-col gap-4">
		<Avatar>
			<AvatarFallback>
				<img src={Assets.Unknown.light} alt={post.title} />
			</AvatarFallback>
			<AvatarImage src={$mode === 'dark' ? post.cover.dark : post.cover.light} />
		</Avatar>
		<div class="flex w-full flex-row items-center gap-1 overflow-x-hidden">
			<CardTitle class="h-auto min-w-0 flex-1 overflow-x-hidden">
				<Tooltip>
					<TooltipTrigger
						class="w-full overflow-y-auto overflow-x-hidden truncate text-ellipsis text-nowrap text-left"
					>
						{post.title}
					</TooltipTrigger>
					<TooltipContent>{post.title}</TooltipContent>
				</Tooltip>
			</CardTitle>
		</div>
		<Separator />
	</CardHeader>
	<CardContent class="flex flex-1 flex-col gap-4">
		<Muted className="flex flex-row gap-2 items-center">
			<Icon icon="i-carbon-tag" />
			<Muted>{post.category}</Muted>
		</Muted>
		<Muted className="flex-1">{ellipsify(post.shortDescription, 100)}</Muted>
		<div class="flex w-full flex-row items-center justify-between">
			<Badge variant="outline">{publishedDate}</Badge>
			<Badge variant="outline">{post.author}</Badge>
		</div>
		<Separator />
	</CardContent>
	<CardFooter class="flex flex-row flex-wrap items-center gap-2">
		{#each post.tags.slice(0, 3) as tag}
			<Badge variant="secondary" class="text-xs">{tag}</Badge>
		{/each}
	</CardFooter>
</FancyCard>
