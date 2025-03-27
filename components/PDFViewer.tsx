import React from "react";

type Props = {
  pdf_url: string;
};

const PDFviewer = ({ pdf_url }: Props) => {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdf_url}&embedded=true`}
      className="w-full h-[95vh] rounded-lg"
    ></iframe>
  );
};

export default PDFviewer;