import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

async function testFetch(
  endpoint: string,
  options: { method?: string; body?: any; preferRepresentation?: boolean } = {}
) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers: Record<string, string> = {
    apikey: ANON_KEY!,
    Authorization: `Bearer ${ANON_KEY}`,
    "Content-Type": "application/json",
  };

  if (options.preferRepresentation) {
    headers["Prefer"] = "return=representation";
  } else if (options.method === "POST") {
    headers["Prefer"] = "return=minimal";
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  const rawText = await response.text();
  let data;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch {
    data = rawText;
  }

  return { status, data };
}

async function runVerification() {
  console.log("=================================================");
  console.log("Verifying Row-Level Security via Supabase REST API");
  console.log("Using Public Anon Key:", ANON_KEY!.substring(0, 15) + "...");
  console.log("=================================================\n");

  let passedAll = true;

  // Test 1: Reading Public Content Table (Project)
  console.log("1. Testing GET /rest/v1/Project (Public Read)...");
  const res1 = await testFetch("Project?select=*");
  if (res1.status === 200 && Array.isArray(res1.data)) {
    console.log(`   ✅ PASS: Successfully read ${res1.data.length} projects.`);
  } else {
    console.error(`   ❌ FAIL: Status ${res1.status}, data:`, res1.data);
    passedAll = false;
  }

  // Test 2: Reading Public Content Table (SiteContent)
  console.log("2. Testing GET /rest/v1/SiteContent (Public Read)...");
  const res2 = await testFetch("SiteContent?select=*");
  if (res2.status === 200 && Array.isArray(res2.data)) {
    console.log(`   ✅ PASS: Successfully read ${res2.data.length} SiteContent record(s).`);
  } else {
    console.error(`   ❌ FAIL: Status ${res2.status}, data:`, res2.data);
    passedAll = false;
  }

  // Test 3: Reading Sensitive Table (Message) via anon key
  console.log("3. Testing GET /rest/v1/Message (Should be BLOCKED for anon)...");
  const res3 = await testFetch("Message?select=*");
  if (res3.status === 200 && Array.isArray(res3.data) && res3.data.length === 0) {
    console.log("   ✅ PASS: Reading Message table returned 0 rows (RLS default deny for SELECT).");
  } else if (res3.status === 401 || res3.status === 403) {
    console.log(`   ✅ PASS: Reading Message table blocked with status ${res3.status}.`);
  } else {
    console.error(`   ❌ FAIL: Reading Message table unexpectedly returned status ${res3.status}:`, res3.data);
    passedAll = false;
  }

  // Test 4: Submitting a message to Message table via anon key
  console.log("4. Testing POST /rest/v1/Message (Anon INSERT for Contact Form)...");
  const testMessage = {
    id: `test-rls-${Date.now()}`,
    name: "RLS Tester",
    email: "rls-test@example.com",
    message: "Automated test message verifying contact form INSERT policy.",
  };
  const res4 = await testFetch("Message", { method: "POST", body: testMessage });
  if (res4.status === 201 || res4.status === 200 || res4.status === 204) {
    console.log(`   ✅ PASS: Successfully posted message via anon key (Status ${res4.status}).`);
  } else {
    console.error(`   ❌ FAIL: Status ${res4.status}, data:`, res4.data);
    passedAll = false;
  }

  // Test 5: Attempting unauthorized INSERT to public table (Project) via anon key
  console.log("5. Testing POST /rest/v1/Project (Should be BLOCKED for anon)...");
  const unauthProject = {
    id: `hacked-${Date.now()}`,
    title: "Unauthorized Project",
    slug: `unauthorized-${Date.now()}`,
    description: "Hacked project",
  };
  const res5 = await testFetch("Project", { method: "POST", body: unauthProject });
  if (res5.status >= 400 || (res5.data && res5.data.code === "42501")) {
    console.log(`   ✅ PASS: Unauthorized write to Project table blocked as expected (Status ${res5.status}, Code: ${res5.data?.code || res5.data?.message}).`);
  } else {
    console.error(`   ❌ FAIL: Write to Project table was NOT blocked! Status ${res5.status}, data:`, res5.data);
    passedAll = false;
  }

  // Test 6: Attempting GET on AdminUser table via anon key
  console.log("6. Testing GET /rest/v1/AdminUser (Should be BLOCKED for anon)...");
  const res6 = await testFetch("AdminUser?select=*");
  if (res6.status === 200 && Array.isArray(res6.data) && res6.data.length === 0) {
    console.log("   ✅ PASS: Reading AdminUser table returned 0 rows (RLS default deny).");
  } else if (res6.status === 401 || res6.status === 403) {
    console.log(`   ✅ PASS: Reading AdminUser table blocked with status ${res6.status}.`);
  } else {
    console.error(`   ❌ FAIL: Reading AdminUser table was NOT blocked! Status ${res6.status}:`, res6.data);
    passedAll = false;
  }

  // Test 7: Attempting GET on ActivityLog table via anon key
  console.log("7. Testing GET /rest/v1/ActivityLog (Should be BLOCKED for anon)...");
  const res7 = await testFetch("ActivityLog?select=*");
  if (res7.status === 200 && Array.isArray(res7.data) && res7.data.length === 0) {
    console.log("   ✅ PASS: Reading ActivityLog table returned 0 rows (RLS default deny).");
  } else if (res7.status === 401 || res7.status === 403) {
    console.log(`   ✅ PASS: Reading ActivityLog table blocked with status ${res7.status}.`);
  } else {
    console.error(`   ❌ FAIL: Reading ActivityLog table was NOT blocked! Status ${res7.status}:`, res7.data);
    passedAll = false;
  }

  console.log("\n=================================================");
  if (passedAll) {
    console.log("🎉 ALL RLS VERIFICATION TESTS PASSED SUCCESSFULLY!");
  } else {
    console.error("⚠️ SOME RLS VERIFICATION TESTS FAILED.");
    process.exit(1);
  }
}

runVerification().catch((e) => {
  console.error("Verification script error:", e);
  process.exit(1);
});
