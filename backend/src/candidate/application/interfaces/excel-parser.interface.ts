export interface ExcelRowData {
  seniority: string;
  years: number;
  availability: boolean;
}

export interface IExcelParserService {
  parseFile(buffer: Buffer): Promise<ExcelRowData>;
}

