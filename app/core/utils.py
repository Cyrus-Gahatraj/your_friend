from argon2 import PasswordHasher
hasher = PasswordHasher()

def hash(password: str):
    return hasher.hash(password)

def verify(password_provided: str, hash_password: str):
    return hasher.verify(hash_password, password_provided)

if __name__ == '__main__':
    password = 'test'
    print(hash(password))