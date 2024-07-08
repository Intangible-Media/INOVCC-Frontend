// hooks/usePdfMake.js

import { useEffect, useState } from "react";

const usePdfMake = () => {
  const [pdfMake, setPdfMake] = useState(null);

  useEffect(() => {
    const loadPdfMake = async () => {
      const pdfMakeModule = (await import("pdfmake/build/pdfmake")).default;
      const pdfFontsModule = (await import("pdfmake/build/vfs_fonts")).default;
      pdfMakeModule.vfs = pdfFontsModule.pdfMake.vfs;
      setPdfMake(pdfMakeModule);
    };

    loadPdfMake();
  }, []);

  return pdfMake;
};

export default usePdfMake;
