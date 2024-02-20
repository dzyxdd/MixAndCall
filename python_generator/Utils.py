import hashlib


def process_string(s):
    s = ''.join(s.split()).lower()
    hash_object = hashlib.sha256(s.encode())
    hex_dig = hash_object.hexdigest()
    return hex_dig
