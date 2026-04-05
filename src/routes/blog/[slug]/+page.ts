import BlogData from '$lib/data/blog';

export function load({ params }: { params: Record<string, string> }) {
	if (params.slug) {
		const item = BlogData.items.find((item) => {
			return item.slug === params.slug;
		});

		return { item };
	}
}
