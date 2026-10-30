import { Pipe, PipeTransform } from '@angular/core';

/**
 * FormatGuestNamePipe
 *
 * Formats guest full name based on the privacy configuration.
 * - When maskEnabled is false: Returns the full name as-is (e.g. "Hajar Lemsayeh").
 * - When maskEnabled is true:
 *   - If multiple words: Displays first names + last name initial with a dot (e.g. "Hajar Lemsayeh" -> "Hajar L.", "Siham Naji" -> "Siham N.", "Jean Luc Godard" -> "Jean Luc G.").
 *   - If single word: If length > 3, displays first 3 letters followed by "..." (e.g. "Cherkaoui" -> "Che..."), otherwise keeps the name untouched (e.g. "Ali" -> "Ali").
 *   - Handles Arabic, Latin, and mixed character sets gracefully.
 */
@Pipe({
  name: 'formatGuestName',
  standalone: true
})
export class FormatGuestNamePipe implements PipeTransform {
  public transform(fullName: string | null | undefined, maskEnabled: boolean = false): string {
    return FormatGuestNamePipe.format(fullName, maskEnabled);
  }

  public static format(fullName: string | null | undefined, maskEnabled: boolean = false): string {
    if (!fullName) {
      return '';
    }

    if (!maskEnabled) {
      return fullName;
    }

    const trimmed = fullName.trim();
    if (!trimmed) {
      return '';
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      const single = parts[0];
      return single.length > 3 ? single.slice(0, 3) + '...' : single;
    }

    const lastName = parts[parts.length - 1];
    const firstNames = parts.slice(0, -1).join(' ');
    const initial = lastName.charAt(0).toUpperCase();

    return `${firstNames} ${initial}.`;
  }
}

/**
 * MaskEmailPipe
 * Masks an email for privacy when maskEnabled is true.
 * e.g. "siham.naji@gmail.com" -> "s***i@gmail.com"
 * e.g. "fatima.nad@gmail.com" -> "f***d@gmail.com"
 * e.g. "me@domain.com" -> "m***@domain.com"
 */
@Pipe({
  name: 'maskEmail',
  standalone: true
})
export class MaskEmailPipe implements PipeTransform {
  public transform(email: string | null | undefined, maskEnabled: boolean = false): string {
    return MaskEmailPipe.format(email, maskEnabled);
  }

  public static format(email: string | null | undefined, maskEnabled: boolean = false): string {
    if (!email) {
      return '';
    }

    if (!maskEnabled) {
      return email;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      return '';
    }

    const atIndex = trimmed.indexOf('@');
    if (atIndex === -1) {
      return trimmed.length > 3 ? trimmed.slice(0, 2) + '***' : '***';
    }

    const username = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex); // includes '@'

    if (username.length <= 2) {
      return `${username.charAt(0)}***${domain}`;
    }

    const firstChar = username.charAt(0);
    const lastChar = username.charAt(username.length - 1);
    return `${firstChar}***${lastChar}${domain}`;
  }
}

/**
 * MaskPhonePipe
 * Masks a phone number for privacy when maskEnabled is true.
 * e.g. "0612478512" -> "06 •••• •• 12"
 * e.g. "+212657773482" -> "+212 6 •••• 82"
 * e.g. "+212 6 66 77 88 99" -> "+212 6 •••• 99"
 */
@Pipe({
  name: 'maskPhone',
  standalone: true
})
export class MaskPhonePipe implements PipeTransform {
  public transform(phone: string | null | undefined, maskEnabled: boolean = false): string {
    return MaskPhonePipe.format(phone, maskEnabled);
  }

  public static format(phone: string | null | undefined, maskEnabled: boolean = false): string {
    if (!phone) {
      return '';
    }

    if (!maskEnabled) {
      return phone;
    }

    const trimmed = phone.trim();
    if (!trimmed) {
      return '';
    }

    const digits = trimmed.replace(/\D/g, '');
    if (digits.length <= 4) {
      return '•• ••';
    }

    if (trimmed.startsWith('+')) {
      const prefix = trimmed.slice(0, 6);
      const suffix = trimmed.slice(-2);
      return `${prefix} •••• ${suffix}`;
    }

    const prefix = trimmed.slice(0, 2);
    const suffix = trimmed.slice(-2);
    return `${prefix} •••• •• ${suffix}`;
  }
}

export const GUEST_PRIVACY_PIPES = [FormatGuestNamePipe, MaskEmailPipe, MaskPhonePipe] as const;
