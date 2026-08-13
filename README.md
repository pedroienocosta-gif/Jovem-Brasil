# Jovem Brasil website

A static site: four HTML pages, one stylesheet, one script, one data file. No server, no database, no build step.

## Files

    index.html            Home
    who-we-are.html       Who we are
    publications.html     Publications (topic buttons + PDF list)
    admin.html            Paper entry (don't deploy this one)
    assets/styles.css     Styling
    assets/site.js        Scroll animation, list rendering, PDF preview
    assets/zip.js         Bundles the admin export
    data/papers.js        Topics and papers
    papers/               The PDFs

## Deploying

Upload the whole folder to GitHub Pages, Netlify, Vercel or any ordinary host. On Netlify you can drag the folder onto the deploy screen.

## Adding a paper

1. Open `admin.html` in a browser (double-clicking the file works).
2. Enter the paper: title, authors, topic, year, and choose the PDF itself.
3. Write the note that appears in the box under the paper on the site — 30 to 50 words. You can edit any note later straight in the table in step 4.
4. Click **Download bundle**. You get a zip holding `data/papers.js` and every PDF you attached, already in the right folders.
5. Unzip it over your copy of the site, overwriting `data/papers.js`, then upload.

On the site, each paper has a **Preview** button that opens the PDF inline with the note beside it. On phones the embed is skipped — browsers there mostly refuse to render a PDF in a frame — so the preview shows the note and a link to the PDF.

PDFs live in the browser only for the admin session that loaded them. Coming back later to fix a note is fine; the entry is in `papers.js`. Re-attach the PDF only for a paper whose file isn't on the site yet.

While `data/papers.js` has no papers in it, the publications page shows the "stay tuned" panel, including inside each topic.

`admin.html` has no password, because a password in a static site sits in plain view in the page source. Two ways round it: don't upload the file at all and run it locally, or lock the URL through your host, like Netlify's password protection.

## Change before publishing

- `contact@jovembrasil.org` appears in the footer of all pages and in the contact calls.
- The topics in `data/papers.js`, if you want different ones.

## Custom domain

The site works on any host. To run it at `www.jovembrasil.org` you need to register the domain, then point it at whichever host you deployed to — Netlify, Vercel and GitHub Pages all support custom domains for free and issue the HTTPS certificate automatically.

## Accessibility notes

Entry animations respect `prefers-reduced-motion`: anyone with that setting on sees a static page. Keyboard focus stays visible on every link and button.
