const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/api/admin/**/*.ts');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (content.includes('requireAdminAuth(')) {
    continue;
  }

  // Ensure import
  if (!content.includes('requireAdminAuth')) {
    content = "import { requireAdminAuth } from '@/lib/admin-auth';\n" + content;
    changed = true;
  }

  // Find export async function GET, POST, DELETE, PUT
  const methods = ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'];
  for (const method of methods) {
    const rx = new RegExp(`export async function ${method}\\(request: NextRequest\\) \\{\\s*(try \\{)?`, 'g');
    if (rx.test(content)) {
      content = content.replace(rx, `export async function ${method}(request: NextRequest) {\n  const authError = await requireAdminAuth(request);\n  if (authError) return authError;\n\n  $1`);
      changed = true;
    } else {
        const rx2 = new RegExp(`export async function ${method}\\(req: NextRequest\\) \\{\\s*(try \\{)?`, 'g');
        if (rx2.test(content)) {
          content = content.replace(rx2, `export async function ${method}(req: NextRequest) {\n  const authError = await requireAdminAuth(req);\n  if (authError) return authError;\n\n  $1`);
          changed = true;
        }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
}
