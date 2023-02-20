<script lang="ts">
  import { fetch } from "./lib/reddit";
  import { writable, derived } from "svelte/store";

  const displayModes = [
    ["fit-height", "Fit Height"],
    ["fit-width", "Fit Width"],
  ];
  let displayMode = displayModes[0][0];
  const setDisplayMode = (m: string) => {
    displayMode = m;
  };

  // default url is derived from URL query param; on change via text box load new urls.
  let galleryUrl = writable(window.location.search);
  const onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    window.history.pushState(null, "", "?" + target?.value);
    galleryUrl.set(target?.value);
  };
  let urls = derived(
    galleryUrl,
    ($galleryUrl, set) => {
      fetch($galleryUrl).then((results) => {
        set(results);
      });
    },
    []
  );
</script>

<!-- pico.css demands nav and main be children of body, so we're going to
     wrap the entire app in a fairly harmless second <body> tag. -->
<body>
  <nav class="container-fluid">
    <ul>
      <li><strong>Reddit Gallery Scroller</strong></li>
    </ul>
    <ul>
      {#each displayModes as [mode, label]}
        <li>
          <!-- svelte-ignore a11y-invalid-attribute -->
          <a
            href="#"
            role="button"
            class="secondary outline"
            on:click={() => setDisplayMode(mode)}
          >
            {label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  <main class="container">
    <form>
      <input
        type="search"
        id="search"
        name="search"
        placeholder="Paste a Reddit Gallery URL..."
        on:input={(e) => onChange(e)}
        on:submit={(e) => e.preventDefault()}
      />
    </form>

    <content>
      {#each $urls as url}
        <a href={url}>
          <img class={displayMode} alt={url} src={url} />
        </a>
      {/each}
    </content>
  </main>
</body>

<style>
  form {
    display: flex;
    align-items: center;
    justify-items: center;
    gap: 1rem;
  }
  form > input {
    margin: 0;
  }
  li > a {
    font-size: 0.75rem;
  }

  content {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    gap: 1rem;
  }

  :global(.fit-width) {
    max-width: 97vw;
  }

  :global(.fit-height) {
    max-height: 97vh;
  }
</style>
