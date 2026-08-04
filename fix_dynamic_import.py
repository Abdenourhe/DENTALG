import glob
p = glob.glob('src/app/*/superadmin/clinics/page.tsx')[0]
content = open(p).read()
content = content.replace('await import("./actions")', 'await import("../actions")')
open(p, 'w').write(content)
print('fixed dynamic import')
