async function main() {
  console.log("Testing API layer...");
  try {
    const listRes = await fetch('http://localhost:3000/api/listings');
    const lists = await listRes.json();
    console.log("Listings count:", lists.total || (lists.listings ? lists.listings.length : 0));
  } catch(e) { console.error("Listings error:", e.message); }

  try {
    const uRes = await fetch('http://localhost:3000/api/admin/users');
    const users = await uRes.json();
    console.log("Users count:", users.length || users.total || 0);
  } catch(e) { console.error("Users error:", e.message); }

  try {
    const t0 = Date.now();
    await fetch('http://localhost:3000/');
    console.log("Home Page TTFB (ms):", Date.now() - t0);
  } catch(e) { console.error("Home page error:", e.message); }
}
main();
