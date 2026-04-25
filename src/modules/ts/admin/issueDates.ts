type TimestampInput = string | number | null | undefined;

const toTimestampNumber = (value: TimestampInput): number | null => {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const parsed = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};

const pad = (value: number) => (value < 10 ? `0${value}` : String(value));

const formatUtcDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    return `${year}-${month}-${day}`;
};

const formatUtcMonth = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    return `${year}-${month}`;
};

export const timestampToDateInput = (value: TimestampInput): string => {
    const timestamp = toTimestampNumber(value);
    return timestamp ? formatUtcDate(timestamp) : '';
};

export const timestampToMonthInput = (value: TimestampInput): string => {
    const timestamp = toTimestampNumber(value);
    return timestamp ? formatUtcMonth(timestamp) : '';
};

export const dateInputToTimestamp = (value: string): number | null => {
    if (!value) {
        return null;
    }
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
        return null;
    }
    const [, yearRaw, monthRaw, dayRaw] = match;
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
        return null;
    }
    return Math.floor(Date.UTC(year, month - 1, day, 12, 0, 0) / 1000);
};

export const monthInputToTimestamp = (value: string): number | null => {
    if (!value) {
        return null;
    }
    const match = value.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
        return null;
    }
    const [, yearRaw, monthRaw] = match;
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
        return null;
    }
    return Math.floor(Date.UTC(year, month - 1, 1, 12, 0, 0) / 1000);
};

export const toDayMonthYearLabel = (value: TimestampInput): string => {
    const timestamp = toTimestampNumber(value);
    if (!timestamp) {
        return '';
    }
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(timestamp * 1000));
};

export const toMonthYearLabel = (value: TimestampInput): string => {
    const timestamp = toTimestampNumber(value);
    if (!timestamp) {
        return '';
    }
    return new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(timestamp * 1000));
};

export const todayDateInput = (): string => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`;
};

export const currentMonthInput = (): string => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}`;
};
