import { Test, TestingModule } from '@nestjs/testing';
import * as XLSX from 'xlsx';
import { ExcelParserService } from './excel-parser.service';
import { ExcelParseException } from './excel-parse.exception';

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelParserService],
    }).compile();

    service = module.get<ExcelParserService>(ExcelParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseFile', () => {
    it('should parse valid Excel with junior seniority', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
      ]);

      const result = await service.parseFile(buffer);

      expect(result).toEqual({
        seniority: 'junior',
        years: 2,
        availability: true,
      });
    });

    it('should parse valid Excel with senior seniority', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'senior', years: 10, availability: false },
      ]);

      const result = await service.parseFile(buffer);

      expect(result).toEqual({
        seniority: 'senior',
        years: 10,
        availability: false,
      });
    });

    it('should parse Excel with 0 years of experience', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 0, availability: true },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.years).toBe(0);
    });

    it('should normalize seniority to lowercase', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'Junior', years: 3, availability: true },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.seniority).toBe('junior');
    });

    it('should handle SENIOR in uppercase', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'SENIOR', years: 15, availability: false },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.seniority).toBe('senior');
    });

    it('should handle case-insensitive column names', async () => {
      const buffer = createExcelBuffer([
        { Seniority: 'junior', Years: 5, Availability: true },
      ]);

      const result = await service.parseFile(buffer);

      expect(result).toEqual({
        seniority: 'junior',
        years: 5,
        availability: true,
      });
    });

    it('should handle string "true" as boolean true', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: 'true' },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.availability).toBe(true);
    });

    it('should handle string "false" as boolean false', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'senior', years: 8, availability: 'false' },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.availability).toBe(false);
    });

    it('should handle "yes" as boolean true', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 1, availability: 'yes' },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.availability).toBe(true);
    });

    it('should handle "no" as boolean false', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'senior', years: 12, availability: 'no' },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.availability).toBe(false);
    });

    it('should handle numeric 1 as boolean true', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 3, availability: 1 },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.availability).toBe(true);
    });

    it('should handle numeric 0 as boolean false', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'senior', years: 7, availability: 0 },
      ]);

      const result = await service.parseFile(buffer);

      expect(result.availability).toBe(false);
    });
  });

  describe('validation errors', () => {
    it('should throw ExcelParseException for empty Excel', async () => {
      const buffer = createExcelBuffer([]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Excel file is empty');
    });

    it('should throw ExcelParseException for more than one row', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
        { seniority: 'senior', years: 10, availability: false },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('must contain only 1 data row');
    });

    it('should throw ExcelParseException for missing seniority column', async () => {
      const buffer = createExcelBuffer([
        { years: 5, availability: true },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Missing required column(s): seniority');
    });

    it('should throw ExcelParseException for missing years column', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', availability: true },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Missing required column(s): years');
    });

    it('should throw ExcelParseException for missing availability column', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 3 },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Missing required column(s): availability');
    });

    it('should throw ExcelParseException for invalid seniority value', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'intermediate', years: 5, availability: true },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Invalid seniority value');
    });

    it('should throw ExcelParseException for empty seniority', async () => {
      const buffer = createExcelBuffer([
        { seniority: '', years: 5, availability: true },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Seniority must be a non-empty string');
    });

    it('should throw ExcelParseException for negative years', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: -1, availability: true },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Years cannot be negative');
    });

    it('should throw ExcelParseException for non-numeric years', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 'abc', availability: true },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Years must be a number');
    });

    it('should throw ExcelParseException for invalid availability value', async () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 5, availability: 'maybe' },
      ]);

      await expect(service.parseFile(buffer)).rejects.toThrow(ExcelParseException);
      await expect(service.parseFile(buffer)).rejects.toThrow('Invalid availability value');
    });

    it('should throw ExcelParseException for corrupt buffer', async () => {
      const corruptBuffer = Buffer.from('not an excel file');

      await expect(service.parseFile(corruptBuffer)).rejects.toThrow(ExcelParseException);
    });
  });
});

// Helper function to create Excel buffer for testing
function createExcelBuffer(data: any[]): Buffer {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

