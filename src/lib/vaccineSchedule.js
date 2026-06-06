/**
 * Singapore National Childhood Immunisation Schedule (NCIS).
 * Source: Health Sciences Authority / MOH Singapore.
 *
 * dueAge.months — calendar months after date of birth
 * dueAge.days   — days after date of birth (used for birth vaccines only)
 */
export const VACCINE_SCHEDULE = [
  { id: "bcg", name: "BCG", dueAge: { days: 0 }, mandatory: true },
  {
    id: "hepb_1",
    name: "Hepatitis B (1)",
    dueAge: { days: 0 },
    mandatory: true,
  },
  {
    id: "hepb_2",
    name: "Hepatitis B (2)",
    dueAge: { months: 1 },
    mandatory: true,
  },
  {
    id: "dtap_1",
    name: "DTaP-IPV-Hib (1)",
    dueAge: { months: 2 },
    mandatory: true,
  },
  { id: "pcv_1", name: "PCV13 (1)", dueAge: { months: 2 }, mandatory: true },
  {
    id: "rota_1",
    name: "Rotavirus (1)",
    dueAge: { months: 2 },
    mandatory: false,
  },
  {
    id: "dtap_2",
    name: "DTaP-IPV-Hib (2)",
    dueAge: { months: 4 },
    mandatory: true,
  },
  { id: "pcv_2", name: "PCV13 (2)", dueAge: { months: 4 }, mandatory: true },
  {
    id: "rota_2",
    name: "Rotavirus (2)",
    dueAge: { months: 4 },
    mandatory: false,
  },
  {
    id: "dtap_3",
    name: "DTaP-IPV-Hib (3)",
    dueAge: { months: 6 },
    mandatory: true,
  },
  {
    id: "rota_3",
    name: "Rotavirus (3)",
    dueAge: { months: 6 },
    mandatory: false,
  },
  { id: "pcv_3", name: "PCV13 (3)", dueAge: { months: 12 }, mandatory: true },
  { id: "mmr_1", name: "MMR (1)", dueAge: { months: 12 }, mandatory: true },
  {
    id: "varicella_1",
    name: "Varicella (1)",
    dueAge: { months: 15 },
    mandatory: false,
  },
  {
    id: "dtap_booster",
    name: "DTaP-IPV-Hib (booster)",
    dueAge: { months: 18 },
    mandatory: true,
  },
  { id: "mmr_2", name: "MMR (2)", dueAge: { months: 18 }, mandatory: true },
  {
    id: "varicella_2",
    name: "Varicella (2)",
    dueAge: { months: 18 },
    mandatory: false,
  },
];

/**
 * Returns the calendar date on which a vaccine is due, given the baby's DOB.
 *
 * @param {{ dueAge: { months?: number, days?: number } }} vaccine
 * @param {Date} dateOfBirth
 * @returns {Date}
 */
export function getDueDate(vaccine, dateOfBirth) {
  const due = new Date(dateOfBirth);

  if ("months" in vaccine.dueAge) {
    due.setMonth(due.getMonth() + vaccine.dueAge.months);
  } else if ("days" in vaccine.dueAge) {
    due.setDate(due.getDate() + vaccine.dueAge.days);
  }

  return due;
}
