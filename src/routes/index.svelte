<script>
  import '@fontsource/rajdhani';
  import '@fontsource/libre-franklin';

  const H_ELLIPSIS_ENTITY = '\u2026'; // ...
  const LEFT_DOUBLE_QUOTE_ENTITY = '\u201c'; // "
  const RIGHT_DOUBLE_QUOTE_ENTITY = '\u201d'; // "

  let isSubmitting = false;
  let uploadComplete = false;
  let files = [];
  let errors = { files: null };
  let downdloadUrl = '';
  $: filename = files.length > 0 ? files[0].name : '';

  function resetForm() {
    files = [];
    errors = { files: null };
  }

  const handleChange = (event) => {
    errors = { files: null };
    files = event.target.files;
  };

  const handleSubmit = async () => {
    try {
      if (files.length === 0) {
        errors.files = 'Select a file to upload first';
        return;
      }

      isSubmitting = true;
      const { name: key, type } = files[0];

      // get signed upload URL
      const response = await fetch('/api/presigned-urls.json', {
        method: 'POST',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });
      const json = await response.json();
      const { readSignedUrl, writeSignedUrl } = json;
      downdloadUrl = readSignedUrl;

      // Upload file
      const reader = new FileReader();
      reader.onloadend = async () => {
        await fetch(writeSignedUrl, {
          method: 'PUT',
          body: reader.result,
          headers: {
            'Content-Type': type,
          },
        });
        uploadComplete = true;
        isSubmitting = false;
      };
      reader.readAsArrayBuffer(files[0]);
    } catch (error) {
      console.log(`Error in handleSubmit on / route: ${error}`);
    }
  };
</script>

<svelte:head>
  <title>SvelteKit S3 Compatible Storage</title>
  <html lang="en-GB" />
  <meta
    name="description"
    content="Upload a file to third party storage using an S3 compatible API in SvelteKit."
  />
</svelte:head>

<main class="container">
  <h1>SvelteKit S3 Compatible Storage</h1>
  {#if uploadComplete}
    <section class="upload-complete">
      <h2 class="heading">Upload complete</h2>
      <p class="filename">
        Download link: <a aria-label={`Download ${filename}`} href={downdloadUrl}>{filename}</a>
      </p>
      <div class="button-container">
        <button
          class="another-upload-button"
          on:click={() => {
            uploadComplete = false;
            resetForm();
          }}>Upload another file</button
        >
      </div>
    </section>
  {:else}
    <section class="upload">
      <form on:submit|preventDefault={handleSubmit}>
        <h2 class="heading">Upload a file{H_ELLIPSIS_ENTITY}</h2>
        {#if filename !== ''}
          <p class="filename">{filename}</p>
          <p class="filename">
            Click {LEFT_DOUBLE_QUOTE_ENTITY}Upload{RIGHT_DOUBLE_QUOTE_ENTITY} to start upload.
          </p>
        {/if}
        {#if errors.files}
          <div class="error-text-container">
            <small id="files-error" class="error-text">{errors.files}</small>
          </div>
        {/if}
        {#if isSubmitting}
          <small id="files-error">Uploading{H_ELLIPSIS_ENTITY}</small>
        {/if}
        <div class="file-input-container">
          <label class="file-input-label" for="file"
            ><span class="screen-reader-text">Find a file to upload</span></label
          >
          <input
            id="file"
            aria-invalid={errors.files != null}
            aria-describedby={errors.files != null ? 'files-error' : null}
            type="file"
            multiple
            formenctype="multipart/form-data"
            accept="image/*"
            title="File"
            on:change={handleChange}
          />
          <div class="button-container">
            <button type="submit" disabled={isSubmitting}>Upload</button>
          </div>
        </div>
      </form>
    </section>
  {/if}
</main>

<style>
  :global(html) {
    background-image: linear-gradient(
      to top right,
      var(--colour-theme-lighten-20),
      var(--colour-theme)
    );
    color: var(--colour-light);

    font-family: Libre Franklin;
  }

  :global(:root) {
    --colour-theme: #3185fc; /* azure */
    --colour-theme-lighten-20: #4599ff;
    --colour-light: #fafaff; /* ghost white */
    --colour-light-opacity-85: #fafaffd9;
    --colour-dark: #403f4c; /* dark liver */
    --colour-feature: #f9dc5c; /* dark liver */
    --colour-alternative: #e84855; /* dark liver */
    --font-weight-medium: 500;
  }

  .screen-reader-text {
    border: 0;
    clip: rect(1px, 1px, 1px, 1px);
    clip-path: inset(50%);
    height: 1px;
    margin: -1px;
    width: 1px;
    overflow: hidden;
    position: absolute !important;
    word-wrap: normal !important;
  }
  .error-text-container {
    margin: 2rem 0 0.5rem;
  }
  .error-text {
    color: var(--colour-feature);
    background-color: var(--colour-dark);
    padding: 0.5rem 1.25rem;
    border-radius: 1.5rem;
    border: solid 0.0625rem var(--colour-feature);
  }

  .container {
    margin: 1.5rem;
    min-height: 100vh;
  }

  .container h1 {
    font-family: Rajdhani;
    font-size: 1.953rem;
  }

  .upload,
  .upload-complete {
    margin: 4rem 1rem;
    padding: 1.5rem;
    border: solid 0.125rem var(--colour-light);
    border-radius: 0.5rem;
  }

  .button-container {
    display: flex;
  }

  :is(.upload, .upload-complete) .heading {
    font-family: Rajdhani;
    font-size: 1.563rem;
    margin-top: 0;
  }

  .upload-complete {
    background-color: var(--colour-feature);
    color: var(--colour-dark);
    border-color: var(--colour-dark);
  }
  .filename {
    margin-left: 1rem;
  }

  .filename a {
    color: var(--colour-dark);
    text-underline-offset: 0.125rem;
  }

  .file-input-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 1.5rem 0 0.5rem;
  }

  .file-input-label::before {
    content: 'Browse\2026';
    margin-left: auto;
  }

  .file-input-label::before,
  button {
    font-family: Libre Franklin;
    background: var(--colour-theme);
    cursor: pointer;
    color: var(--colour-light);
    border: solid 0.0625rem var(--colour-light);
    border-radius: 1.5rem;
    margin-left: 1rem;
    padding: 0.5rem 1.75rem;
    font-size: 1.25rem;
    font-weight: var(--font-weight-medium);
  }

  @media (prefers-reduced-motion: no-preference) {
    .file-input-label::before,
    button {
      transition: background-color 250ms, color 250ms;
    }
  }
  @media (prefers-reduced-motion: no-preference) {
    .file-input-label::before,
    button {
      transition: background-color 2000ms, color 2000ms;
    }
  }

  button:hover,
  .file-input-label:hover:before,
  button:focus,
  .file-input-label:focus:before {
    background-color: var(--colour-light-opacity-85);
    color: var(--colour-dark);
  }

  .another-upload-button {
    margin-left: auto;
  }

  .upload-complete button:hover,
  .upload-complete button:focus {
    border-color: var(--colour-dark);
  }

  input[type='file'] {
    visibility: hidden;
    width: 1px;
  }

  @media (min-width: 768px) {
    .container {
      margin: 3rem 1.5rem;
    }

    .upload,
    .upload-complete {
      margin: 4rem 10rem;
    }
  }
</style>
