"use client";

import ReactBarcode from "react-barcode";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export function Barcode({
  value,
  width = 1.5,
  height = 40,
  displayValue = true,
}: BarcodeProps) {
  if (!value) return null;

  return (
    <div className="inline-block rounded-lg border border-slate-200 bg-white p-2">
      <ReactBarcode
        value={value}
        width={width}
        height={height}
        displayValue={displayValue}
        format="CODE128"
        fontSize={12}
      />
    </div>
  );
}
