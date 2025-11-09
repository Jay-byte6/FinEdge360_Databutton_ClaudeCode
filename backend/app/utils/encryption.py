"""
Field-level encryption utility for sensitive financial data.
Uses Fernet (symmetric encryption) from cryptography package.
"""

import os
from cryptography.fernet import Fernet
from typing import Optional, Union
import json

class EncryptionManager:
    """Manages encryption and decryption of sensitive data"""

    def __init__(self):
        """Initialize encryption with key from environment variable"""
        encryption_key = os.getenv("ENCRYPTION_KEY")

        if not encryption_key:
            raise ValueError(
                "ENCRYPTION_KEY environment variable is not set. "
                "Generate one using: from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
            )

        try:
            self.cipher = Fernet(encryption_key.encode())
        except Exception as e:
            raise ValueError(f"Invalid ENCRYPTION_KEY format: {str(e)}")

    def encrypt_value(self, value: Optional[Union[str, int, float]]) -> Optional[str]:
        """
        Encrypt a value (string, int, or float).
        Returns encrypted string or None if input is None.

        Args:
            value: The value to encrypt (can be string, int, float, or None)

        Returns:
            Encrypted string (base64 encoded) or None
        """
        if value is None:
            return None

        # Convert to string if it's a number
        if isinstance(value, (int, float)):
            value = str(value)

        try:
            # Encode the string to bytes, encrypt, and decode back to string
            encrypted_bytes = self.cipher.encrypt(value.encode('utf-8'))
            return encrypted_bytes.decode('utf-8')
        except Exception as e:
            print(f"Error encrypting value: {str(e)}")
            raise

    def decrypt_value(self, encrypted_value: Optional[str]) -> Optional[str]:
        """
        Decrypt an encrypted value.
        Returns decrypted string or None if input is None.

        Args:
            encrypted_value: The encrypted string to decrypt

        Returns:
            Decrypted string or None
        """
        if encrypted_value is None:
            return None

        try:
            # Encode the encrypted string to bytes, decrypt, and decode back to string
            decrypted_bytes = self.cipher.decrypt(encrypted_value.encode('utf-8'))
            return decrypted_bytes.decode('utf-8')
        except Exception as e:
            print(f"Error decrypting value: {str(e)}")
            raise

    def encrypt_dict_fields(self, data: dict, fields_to_encrypt: list) -> dict:
        """
        Encrypt specific fields in a dictionary.

        Args:
            data: Dictionary containing the data
            fields_to_encrypt: List of field paths to encrypt (supports nested keys like "personalInfo.monthlySalary")

        Returns:
            Dictionary with encrypted fields
        """
        encrypted_data = data.copy()

        for field_path in fields_to_encrypt:
            keys = field_path.split('.')

            # Navigate to the field
            current = encrypted_data
            for key in keys[:-1]:
                if key not in current:
                    break
                current = current[key]
            else:
                # Encrypt the final field
                final_key = keys[-1]
                if final_key in current and current[final_key] is not None:
                    current[final_key] = self.encrypt_value(current[final_key])

        return encrypted_data

    def decrypt_dict_fields(self, data: dict, fields_to_decrypt: list) -> dict:
        """
        Decrypt specific fields in a dictionary.

        Args:
            data: Dictionary containing encrypted data
            fields_to_decrypt: List of field paths to decrypt (supports nested keys)

        Returns:
            Dictionary with decrypted fields (as floats if possible)
        """
        decrypted_data = data.copy()

        for field_path in fields_to_decrypt:
            keys = field_path.split('.')

            # Navigate to the field
            current = decrypted_data
            for key in keys[:-1]:
                if key not in current:
                    break
                current = current[key]
            else:
                # Decrypt the final field
                final_key = keys[-1]
                if final_key in current and current[final_key] is not None:
                    decrypted = self.decrypt_value(current[final_key])
                    # Try to convert back to float if it's a number
                    if decrypted:
                        try:
                            current[final_key] = float(decrypted)
                        except ValueError:
                            current[final_key] = decrypted

        return decrypted_data


# Global instance
_encryption_manager = None

def get_encryption_manager() -> EncryptionManager:
    """Get or create the global encryption manager instance"""
    global _encryption_manager
    if _encryption_manager is None:
        _encryption_manager = EncryptionManager()
    return _encryption_manager


# Convenience functions
def encrypt_value(value: Optional[Union[str, int, float]]) -> Optional[str]:
    """Encrypt a single value"""
    return get_encryption_manager().encrypt_value(value)


def decrypt_value(encrypted_value: Optional[str]) -> Optional[str]:
    """Decrypt a single value"""
    return get_encryption_manager().decrypt_value(encrypted_value)


def encrypt_dict_fields(data: dict, fields: list) -> dict:
    """Encrypt specific fields in a dictionary"""
    return get_encryption_manager().encrypt_dict_fields(data, fields)


def decrypt_dict_fields(data: dict, fields: list) -> dict:
    """Decrypt specific fields in a dictionary"""
    return get_encryption_manager().decrypt_dict_fields(data, fields)


# List of sensitive fields to encrypt in financial data
SENSITIVE_FIELDS = [
    "personalInfo.monthlySalary",
    "personalInfo.monthlyExpenses",
    # Illiquid assets
    "assets.illiquid.home",
    "assets.illiquid.other_real_estate",
    "assets.illiquid.jewellery",
    "assets.illiquid.sgb",
    "assets.illiquid.ulips",
    "assets.illiquid.epf_ppf_vpf",
    # Liquid assets
    "assets.liquid.fixed_deposit",
    "assets.liquid.debt_funds",
    "assets.liquid.domestic_stock_market",
    "assets.liquid.domestic_equity_mutual_funds",
    "assets.liquid.cash_from_equity_mutual_funds",
    "assets.liquid.us_equity",
    "assets.liquid.liquid_savings_cash",
    "assets.liquid.gold_etf_digital_gold",
    "assets.liquid.crypto",
    "assets.liquid.reits",
    # Liabilities
    "liabilities.home_loan",
    "liabilities.education_loan",
    "liabilities.car_loan",
    "liabilities.personal_gold_loan",
    "liabilities.credit_card",
    "liabilities.other_liabilities",
]
