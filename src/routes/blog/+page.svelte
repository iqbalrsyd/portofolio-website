<script lang="ts">
	import EmptyResult from '$lib/components/common/empty-result/empty-result.svelte';
	import SearchPage from '$lib/components/common/search-page/search-page.svelte';
	import BlogCard from '$lib/components/blog/blog-card.svelte';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import Toggle from '$lib/components/ui/toggle/toggle.svelte';
	import BlogData from '$lib/data/blog';

	let search = $state('');
	let selectedCategory = $state<string | null>(null);
	let selectedTag = $state<string | null>(null);

	// Get unique categories and tags
	let categories = $derived(
		Array.from(new Set(BlogData.items.map((post) => post.category)))
	);
	
	let tags = $derived(
		Array.from(new Set(BlogData.items.flatMap((post) => post.tags)))
	);

	let result = $derived(
		BlogData.items.filter((post) => {
			const isCategoryFiltered =
				!selectedCategory || post.category === selectedCategory;

			const isTagFiltered =
				!selectedTag || post.tags.includes(selectedTag);

			const isSearched =
				search.trim().length === 0 ||
				post.title.trim().toLowerCase().includes(search.trim().toLowerCase()) ||
				post.shortDescription.trim().toLowerCase().includes(search.trim().toLowerCase());

			return isCategoryFiltered && isTagFiltered && isSearched;
		}).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
	);

	const toggleCategory = (category: string) => {
		selectedCategory = selectedCategory === category ? null : category;
	};

	const toggleTag = (tag: string) => {
		selectedTag = selectedTag === tag ? null : tag;
	};

	const onSearch = (query: string) => (search = query);
</script>

<SearchPage title={BlogData.title} {onSearch}>
	<div class="flex flex-1 flex-col gap-8">
		<!-- Category Filters -->
		<div class="flex flex-col gap-3">
			<h3 class="text-sm font-semibold">Categories</h3>
			<div class="flex flex-row flex-wrap gap-2">
				{#each categories as category}
					<Toggle
						pressed={selectedCategory === category}
						variant="outline"
						class="flex flex-row items-center gap-2 rounded-lg"
						on:click={() => toggleCategory(category)}
					>
						{#if selectedCategory === category}
							<Icon icon="i-carbon-close" />
						{/if}
						{category}
					</Toggle>
				{/each}
			</div>
		</div>

		<!-- Tag Filters -->
		<div class="flex flex-col gap-3">
			<h3 class="text-sm font-semibold">Tags</h3>
			<div class="flex flex-row flex-wrap gap-2">
				{#each tags as tag}
					<Toggle
						pressed={selectedTag === tag}
						variant="outline"
						class="flex flex-row items-center gap-2 rounded-lg"
						on:click={() => toggleTag(tag)}
					>
						{#if selectedTag === tag}
							<Icon icon="i-carbon-close" />
						{/if}
						{tag}
					</Toggle>
				{/each}
			</div>
		</div>

		<!-- Blog Posts Grid -->
		{#if result.length === 0}
			<EmptyResult />
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each result as post (post.slug)}
					<BlogCard {post} />
				{/each}
			</div>
		{/if}
	</div>
</SearchPage>
