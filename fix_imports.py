import glob, os

# Fix messages import
msg_path = glob.glob('src/app/*/superadmin/messages/page.tsx')[0]
with open(msg_path, 'r') as f:
    content = f.read()
content = content.replace('from "./actions"', 'from "../actions"')
with open(msg_path, 'w') as f:
    f.write(content)
print(f"Fixed {msg_path}")

# Fix tickets detail import
ticket_paths = glob.glob('src/app/*/superadmin/tickets/*/page.tsx')
for p in ticket_paths:
    with open(p, 'r') as f:
        content = f.read()
    content = content.replace('from "../actions"', 'from "../../actions"')
    with open(p, 'w') as f:
        f.write(content)
    print(f"Fixed {p}")
