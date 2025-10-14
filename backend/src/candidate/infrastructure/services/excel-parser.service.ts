import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { IExcelParserService, ExcelRowData } from '../../application/interfaces';
import { ExcelParseException } from './excel-parse.exception';

// Pure functions - Functional core
const normalizeString = (s: string): string => s.toLowerCase().trim();

const parseSeniority = (value: unknown): string => {
  if (!value || typeof value !== 'string') {
    throw new ExcelParseException('Seniority must be a non-empty string');
  }
  
  const normalized = normalizeString(value);
  const validValues = ['junior', 'senior'];
  
  if (!validValues.includes(normalized)) {
    throw new ExcelParseException(
      `Invalid seniority value: ${value}. Must be ${validValues.join(' or ')}`
    );
  }
  
  return normalized;
};

const parseYears = (value: unknown): number => {
  if (value === null || value === undefined || value === '') {
    throw new ExcelParseException('Years of experience is required');
  }
  
  const yearsNum = Number(value);
  
  if (isNaN(yearsNum)) {
    throw new ExcelParseException(`Years must be a number, got: ${value}`);
  }
  
  if (yearsNum < 0) {
    throw new ExcelParseException(`Years cannot be negative: ${yearsNum}`);
  }
  
  return yearsNum;
};

const parseAvailability = (value: unknown): boolean => {
  const truthy = ['true', 'yes', '1'];
  const falsy = ['false', 'no', '0'];
  
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  
  if (typeof value === 'string') {
    const normalized = normalizeString(value);
    if (truthy.includes(normalized)) return true;
    if (falsy.includes(normalized)) return false;
  }
  
  throw new ExcelParseException(
    `Invalid availability value: ${value}. Must be true/false, yes/no, or 1/0`
  );
};

const getFieldValue = (row: Record<string, any>) => (fieldName: string): any => {
  // Try exact match first
  if (row[fieldName] !== undefined) {
    return row[fieldName];
  }
  
  // Try case-insensitive match
  const key = Object.keys(row).find(
    k => normalizeString(k) === normalizeString(fieldName)
  );
  
  return key ? row[key] : undefined;
};

const parseRow = (row: Record<string, any>): ExcelRowData => {
  const getValue = getFieldValue(row);
  
  return {
    seniority: parseSeniority(getValue('seniority')),
    years: parseYears(getValue('years')),
    availability: parseAvailability(getValue('availability')),
  };
};

// Service class - Imperative shell
@Injectable()
export class ExcelParserService implements IExcelParserService {
  private readonly REQUIRED_HEADERS = ['seniority', 'years', 'availability'];

  async parseFile(buffer: Buffer): Promise<ExcelRowData> {
    return Promise.resolve(buffer)
      .then(this.readWorkbook)
      .then(this.extractFirstSheet)
      .then(this.validateRowCount)
      .then(this.validateHeaders.bind(this))
      .then(parseRow)
      .catch(this.handleError);
  }

  private readWorkbook = (buffer: Buffer): XLSX.WorkBook => 
    XLSX.read(buffer, { type: 'buffer' });

  private extractFirstSheet = (workbook: XLSX.WorkBook): any[] => {
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new ExcelParseException('Excel file has no sheets');
    }
    
    return XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);
  };

  private validateRowCount = (data: any[]): any => {
    if (!data || data.length === 0) {
      throw new ExcelParseException('Excel file is empty');
    }
    
    if (data.length > 1) {
      throw new ExcelParseException('Excel file must contain only 1 data row');
    }
    
    return data[0];
  };

  private validateHeaders = (row: Record<string, any>): Record<string, any> => {
    const rowKeys = Object.keys(row).map(normalizeString);
    const missing = this.REQUIRED_HEADERS.filter(h => !rowKeys.includes(h));
    
    if (missing.length > 0) {
      throw new ExcelParseException(
        `Missing required column(s): ${missing.join(', ')}. Expected: ${this.REQUIRED_HEADERS.join(', ')}`
      );
    }
    
    return row;
  };

  private handleError = (error: Error): never => {
    if (error instanceof ExcelParseException) {
      throw error;
    }
    throw new ExcelParseException(`Failed to parse Excel file: ${error.message}`);
  };
}

