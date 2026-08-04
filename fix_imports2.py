import glob

# Fix imports in clinic pages
for path in glob.glob('src/app/*/superadmin/clinics/page.tsx') + glob.glob('src/app/*/superadmin/clinic-requests/page.tsx'):
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace('from "./actions"', 'from "../actions"')
    with open(path, 'w') as f:
        f.write(content)
    print(f'Fixed {path}')
