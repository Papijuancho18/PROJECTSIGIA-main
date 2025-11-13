import json

def load_sample_users(filename="sample_users.json"):
    """
    Loads sample user data from a JSON file.
    Ensures that only users with 'admin' or 'staff' roles exist.
    Users with 'committee' role are either removed or their role is changed to 'staff'.
    """
    try:
        with open(filename, 'r') as f:
            users = json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        return []
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{filename}'.")
        return []

    updated_users = []
    for user in users:
        if user.get('role') == 'committee':
            user['role'] = 'staff'  # Change committee role to staff
            updated_users.append(user)
        elif user.get('role') in ('admin', 'staff'):
            updated_users.append(user)
        else:
            print(f"Warning: User {user.get('username', 'Unknown')} has an invalid role and will be excluded.")

    return updated_users

if __name__ == '__main__':
    # Example usage:
    updated_users = load_sample_users()

    if updated_users:
        print("Updated user data:")
        for user in updated_users:
            print(user)
    else:
        print("No users loaded or an error occurred.")
