/**
 * Estados visuais do scrolly do círculo vicioso. Cada etapa acrescenta uma
 * camada à anterior — o desenho acompanha o texto em vez de trocar de assunto.
 */

export const mechanismSteps = [
  "instabilidade",
  "evaporacao",
  "hiperosmolaridade",
  "inflamacao",
  "dano-epitelial",
  "neurossensorial",
] as const;

export type MechanismStep = (typeof mechanismSteps)[number];

export type MechanismLayerState = {
  break: number;
  evaporation: number;
  osmolarity: number;
  inflammation: number;
  nerve: number;
  aqueous: number;
  damagedCells: boolean;
};

export function isMechanismStep(
  value: string | undefined,
): value is MechanismStep {
  return mechanismSteps.some((step) => step === value);
}

export function mechanismLayerState(step: MechanismStep): MechanismLayerState {
  switch (step) {
    case "instabilidade":
      return {
        break: 1,
        evaporation: 0,
        osmolarity: 0,
        inflammation: 0,
        nerve: 0,
        aqueous: 1,
        damagedCells: false,
      };
    case "evaporacao":
      return {
        break: 1,
        evaporation: 1,
        osmolarity: 0,
        inflammation: 0,
        nerve: 0,
        aqueous: 1,
        damagedCells: false,
      };
    case "hiperosmolaridade":
      return {
        break: 1,
        evaporation: 1,
        osmolarity: 1,
        inflammation: 0,
        nerve: 0,
        aqueous: 0.55,
        damagedCells: false,
      };
    case "inflamacao":
      return {
        break: 1,
        evaporation: 1,
        osmolarity: 1,
        inflammation: 1,
        nerve: 0,
        aqueous: 0.55,
        damagedCells: false,
      };
    case "dano-epitelial":
      return {
        break: 1,
        evaporation: 1,
        osmolarity: 1,
        inflammation: 1,
        nerve: 0,
        aqueous: 0.55,
        damagedCells: true,
      };
    case "neurossensorial":
      return {
        break: 1,
        evaporation: 1,
        osmolarity: 1,
        inflammation: 1,
        nerve: 1,
        aqueous: 0.55,
        damagedCells: true,
      };
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}
