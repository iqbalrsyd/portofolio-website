<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import ResumeData from '$lib/data/resume';
	import Title from '$lib/components/common/title/title.svelte';

	let iframeLoaded = $state(false);
</script>

<Title title={ResumeData.title} />

<div class="relative flex h-[calc(100dvh-50px)] w-full flex-col">
	<div class="absolute top-2 right-2 z-10 flex gap-2 sm:top-4 sm:right-4">
		<a href={ResumeData.resume} download target="_blank" rel="noopener noreferrer">
			<Button size="sm" class="shadow-md">
				<Icon icon="i-carbon-download" className="mr-1" />
				Download
			</Button>
		</a>
		<a href={ResumeData.resume} target="_blank" rel="noopener noreferrer">
			<Button size="sm" variant="outline" class="shadow-md">
				<Icon icon="i-carbon-launch" className="mr-1" />
				Open
			</Button>
		</a>
	</div>

	{#if !iframeLoaded}
		<div class="flex flex-1 items-center justify-center">
			<Icon icon="i-carbon-circle-dash" className="animate-spin text-4xl text-muted-foreground" />
		</div>
	{/if}

	<iframe
		src={ResumeData.resume}
		class="h-full w-full border-0"
		title={ResumeData.title}
		onload={() => (iframeLoaded = true)}
	></iframe>
</div>
