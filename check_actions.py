import glob
path = glob.glob('src/app/*/superadmin/actions.ts')[0]
content = open(path).read()
print('toggleClinicStatus' in content)
print('toggleClinicStatusSchema' in content)
