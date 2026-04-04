import os
import pandas as pd

def parse_excel(filepath, outfile):
    try:
        xls = pd.ExcelFile(filepath)
        for sheet in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet)
            outfile.write(f"--- {os.path.basename(filepath)} : {sheet} ---\n")
            outfile.write(df.to_csv(index=False) + "\n\n")
    except Exception as e:
        outfile.write(f"Error parsing {filepath}: {e}\n")

if __name__ == '__main__':
    with open('excel_dump.md', 'w') as f:
        parse_excel('CardVault_V21_Test_Cases.xlsx', f)
        parse_excel('CardVault_V21_Security_Findings.xlsx', f)
        parse_excel('CardVault_V21_Findings_Tracker.xlsx', f)
        parse_excel('CardVault_V21_Performance_Benchmark.xlsx', f)
