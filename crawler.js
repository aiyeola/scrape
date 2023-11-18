const puppeteer = require("puppeteer");

const URL = process.env.CRAWL_URL;

const crawlData = async () => {
  const browser = await puppeteer.launch({ headless: "new" });

  const page = await browser.newPage();
  await page.goto(URL, { timeout: 0 });

  const news = await page.evaluate(() => {
    const trendingNews = document.querySelectorAll(
      "body > div.site-outer > div > div > section.elementor-section.elementor-top-section.elementor-element.elementor-element-e548d53.elementor-section-full_width.elementor-section-height-default.elementor-section-height-default.wpr-particle-no.wpr-jarallax-no.wpr-parallax-no.wpr-sticky-section-no > div > div.elementor-column.elementor-col-50.elementor-top-column.elementor-element.elementor-element-d12afc5 > div > div.elementor-element.elementor-element-c1807b4.elementor-widget.elementor-widget-elementskit-post-list > div > div > ul > li"
    );

    return Array.from(trendingNews).map((news) => {
      const link = news.querySelector("a").href;
      const title = news.querySelector("a > div > span").innerText;

      return { link, title };
    });
  });

  await browser.close();
  return news;
};

module.exports = { crawlData };
