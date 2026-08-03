import glob
path = glob.glob('src/app/*/superadmin/actions.ts')[0]
print('Found:', path)

with open(path, 'r') as f:
    content = f.read()

# Check exact bytes around line 158
lines = content.splitlines()
for i, line in enumerate(lines[140:165], start=141):
    print(f"{i}: {repr(line)}")
