import re

path = "prisma/schema.prisma"
with open(path, "r") as f:
    content = f.read()

# Add supportTickets and userRequests to Clinic model
content = content.replace(
    "  counters             Counter[]\n}",
    "  counters             Counter[]\n  supportTickets       SupportTicket[]\n  userRequests         UserRequest[]\n}"
)

# Add supportTickets and userRequestsCreated to User model
content = content.replace(
    "  labResults           LabResult[]\n\n  @@index([clinicId])",
    "  labResults           LabResult[]\n  supportTickets       SupportTicket[]\n  userRequestsCreated  UserRequest[]\n\n  @@index([clinicId])"
)

with open(path, "w") as f:
    f.write(content)

print("Schema updated successfully")
