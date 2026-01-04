import { getGroupName } from "@/components/groupcodefacilities";

export function groupFacilitiesByCategory(facilities) {
  const groupedByCode = facilities.reduce((acc, facility) => {
    const groupcode = facility.group_code || facility.groupcode;
    if (!acc[groupcode]) {
      acc[groupcode] = [];
    }
    
    const processedFacility = {
      ...facility,
      indFee: facility.indfee > 0 || facility.indfee === true,
      indLogic: facility.indlogic > 0 || facility.indlogic === true,
      indYesOrNo: facility.indyesorno > 0 || facility.indyesorno === true,
      number: facility.number || 0
    };
    
    acc[groupcode].push(processedFacility);
    return acc;
  }, {});

  const result = Object.entries(groupedByCode).map(([groupcode, facilities]) => {
    const code = parseInt(groupcode);
    return {
      groupcode: code,
      groupName: getGroupName(code) || `Unknown Group (${code})`,
      facilities: facilities
    };
  });

  return result.sort((a, b) => a.groupcode - b.groupcode);
}