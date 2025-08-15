export const getCountryName = (code: string, locale = "es") => {
    try {
      const dn = new Intl.DisplayNames([locale], { type: "region" });
      return dn.of(code) || code;
    } catch {
      return code;
    }
  };