Build a simple public web app called "Stock Watch India".

Goal:
Create an easy-to-use stock watchlist website for the Indian stock market. It should be designed for older people who are not very tech savvy. The interface must feel calm, clear, readable, and trustworthy.

Important:
- This app is not for direct "buy now" advice.
- It should present stocks as "Short Term", "Long Term", or "Watchlist".
- Use plain English labels instead of heavy market jargon.
- Make the layout mobile friendly and desktop friendly.
- Use large text, high contrast, big filter controls, and simple explanations.

Main page sections:
- Hero section with a clear explanation of the app
- Filter area with search and dropdown filters
- Stock card grid
- Small explainer section for what stability markers mean
- Footer note saying the app is educational and not financial advice

Stock card requirements:
- Company name
- Symbol
- Sector
- Current stock price
- Daily change with green for up and red for down, but do not rely on color alone
- Bucket label: Short Term, Long Term, or Watchlist
- Price bucket: Under Rs100, Rs100-500, Rs500-2000, Above Rs2000
- Volume bucket: High Volume, Volume Spike, Low Liquidity
- Profitability status: Profitable or Loss-making
- Revenue trend
- Net profit trend
- Debt to equity
- Operating cash flow status
- ROE or ROCE
- Promoter pledge status
- Stability rating: High, Medium, Needs Review
- 3 short evidence points that explain why the stock is on the watchlist

Filtering:
- Search by company name or symbol
- Filter by bucket
- Filter by price bucket
- Filter by volume bucket
- Filter by profitability
- Filter by stability

Design direction:
- Warm, calm, slightly premium
- Avoid generic startup styling
- Use expressive typography
- Make cards feel readable and supportive
- Keep spacing generous
- Use badges and panels to make information easy to scan

Data structure:
- Use demo JSON data for now
- Include at least 8 Indian market example stocks
- Mark the data clearly as demo data

Technical direction:
- Start as a static site with no login and no backend
- Use HTML, CSS, and JavaScript or a simple React app
- Keep it easy to deploy on Cloudflare Pages or GitHub Pages
- Prepare it so that later we can replace demo JSON with a generated daily JSON file

Extra requirement:
- Add a short "How to build this for free" section mentioning:
  - design with Firebase Studio or v0
  - deploy static output to Cloudflare Pages
  - update data once daily instead of live to reduce cost
