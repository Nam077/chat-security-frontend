import forge from 'node-forge';

// Hàm tạo cặp khóa RSA
export function generateRSAKeys() {
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);

    // Xuất khẩu khóa công khai và khóa riêng dưới dạng PEM
    const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);

    return { publicKeyPem, privateKeyPem };
}

/**
 * Mã hóa dữ liệu với khóa công khai (RSA)
 * @param data Dữ liệu cần mã hóa
 * @param publicKeyPem Khóa công khai ở định dạng PEM
 */
export function encryptWithRSA(data: string, publicKeyPem: string): string {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem); // Chuyển đổi PEM thành khóa công khai
    const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
        md: forge.md.sha256.create(), // Sử dụng SHA-256 cho RSA-OAEP
    });
    return forge.util.encode64(encrypted); // Chuyển đổi sang base64 để dễ lưu trữ
}

/**
 * Giải mã dữ liệu với khóa riêng (RSA)
 * @param encryptedData Dữ liệu mã hóa ở dạng base64
 * @param privateKeyPem Khóa riêng ở định dạng PEM
 */
export function decryptWithRSA(encryptedData: string, privateKeyPem: string): string {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem); // Chuyển đổi PEM thành khóa riêng
    const decodedData = forge.util.decode64(encryptedData); // Giải mã từ base64
    const decrypted = privateKey.decrypt(decodedData, 'RSA-OAEP', {
        md: forge.md.sha256.create(), // Sử dụng SHA-256 cho RSA-OAEP
    });
    return decrypted;
}

export const createFixedLengthKey = (input: string = 'default_random_key'): forge.util.ByteBuffer => {
    const md = forge.md.sha256.create();
    md.update(input);
    return md.digest(); // Trả về khóa 256-bit dưới dạng ByteBuffer
};

export const encryptWithAES = (data: string, keyInput: string = 'default_random_key'): string => {
    const key = createFixedLengthKey(keyInput);
    const iv = forge.random.getBytesSync(16); // Tạo IV ngẫu nhiên 16 byte
    const cipher = forge.cipher.createCipher('AES-CBC', key);

    cipher.start({ iv: iv });
    cipher.update(forge.util.createBuffer(data, 'utf8'));
    cipher.finish();

    // Kết hợp IV và ciphertext để lưu trữ hoặc truyền
    const encrypted = forge.util.encode64(iv + cipher.output.getBytes());
    return encrypted;
};

/**
 * Giải mã dữ liệu đã mã hóa bằng AES-256-CBC.
 * Tách IV và ciphertext trước khi giải mã.
 */
export const decryptWithAES = (encryptedData: string, keyInput: string = 'default_random_key'): string => {
    const key = createFixedLengthKey(keyInput);
    const encryptedBytes = forge.util.decode64(encryptedData);
    
    const iv = encryptedBytes.slice(0, 16); // Tách IV ra từ phần đầu
    const encrypted = encryptedBytes.slice(16); // Phần còn lại là ciphertext

    const decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({ iv: iv });
    decipher.update(forge.util.createBuffer(encrypted)); // Không cần chỉ định 'binary'
    const success = decipher.finish();

    if (!success) {
        throw new Error('Giải mã thất bại');
    }

    return decipher.output.toString();
};