function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isArrayofStrings(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

function isPlatform(v: unknown): v is 'ios' | 'android' {
  return v === 'ios' || v === 'android';
}

function isTargetPlatform(v: unknown): v is 'both' | 'ios' | 'android' {
  return v === 'both' || v === 'ios' || v === 'android';
}

function isISODateString(v: unknown): v is string {
  if (!isString(v)) return false;
  const d = new Date(v);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}T/.test(v);
}

function isURL(v: unknown): v is string {
  if (!isString(v)) return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

function isDeepLink(v: unknown): v is string {
  if (!isString(v)) return false;
  return v.startsWith('bomber://') || isURL(v);
}

export function validateRegisterDevice(body: any) {
  const errors: string[] = [];
  if (!isNonEmptyString(body?.userId)) errors.push('userId is required');
  if (!isPlatform(body?.platform))
    errors.push("platform must be 'ios' or 'android'");
  if (!isNonEmptyString(body?.token) || body.token.length < 10)
    errors.push('token is required and must be >=10 chars');
  if (body?.appVersion != null && !isString(body.appVersion))
    errors.push('appVersion must be a string');
  return errors.length ? { ok: false, errors } : { ok: true, data: body };
}

export function validateCreateNotification(body: any) {
  const errors: string[] = [];
  if (!isNonEmptyString(body?.title)) errors.push('title is required');
  if (!isNonEmptyString(body?.body)) errors.push('body is required');

  if (body?.imageUrl != null && !isURL(body.imageUrl))
    errors.push('imageUrl must be a valid URL');
  if (body?.deepLink != null && !isDeepLink(body.deepLink))
    errors.push('deepLink must be bomber:// or a valid https URL');

  const platform = body?.platform ?? 'both';
  if (!isTargetPlatform(platform))
    errors.push("platform must be 'both' | 'ios' | 'android'");
  body.platform = platform;

  const a = body?.audience;
  if (a == null || typeof a !== 'object') errors.push('audience is required');
  else {
    if (a.roles != null && !isArrayofStrings(a.roles))
      errors.push('audience.roles must be string[]');
    if (a.regions != null && !isArrayofStrings(a.regions))
      errors.push('audience.regions must be string[]');
    if (a.teamIds != null && !isArrayofStrings(a.teamIds))
      errors.push('audience.teamIds must be string[]');
    if (a.userIds != null && !isArrayofStrings(a.userIds))
      errors.push('audience.userIds must be string[]');
    if (!a.all && !a.roles && !a.regions && !a.teamIds && !a.userIds) {
      errors.push(
        'audience must specify at least one of: all, roles, regions, teamIds, userIds'
      );
    }
  }

  if (body?.scheduledAt != null && !isISODateString(body.scheduledAt))
    errors.push('scheduledAt must be ISO datetime');
  if (
    body?.data != null &&
    (typeof body.data !== 'object' || Array.isArray(body.data))
  )
    errors.push('data must be an object of string values');
  if (body?.data) {
    for (const [k, v] of Object.entries(body.data)) {
      if (!isString(v)) errors.push(`data.${k} must be a string`);
    }
  }

  return errors.length ? { ok: false, errors } : { ok: true, data: body };
}

export function validateOpenReceipt(body: any) {
  const errors: string[] = [];
  if (!isNonEmptyString(body?.notificationId))
    errors.push('notificationId is required');
  return errors.length ? { ok: false, errors } : { ok: true, data: body };
}
