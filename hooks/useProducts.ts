// hooks/useProducts.ts
// Fetches live product data from API routes.
// All pages use this instead of sampleData.

"use client";

import { useState, useEffect, useCallback } from "react";

export interface ApiGadget {
  id: string; name: string; brand: string; type: string;
  price: number; image_url: string; description: string;
  condition: string; specs: Record<string, string>; stock: number;
}
export interface ApiJersey {
  id: string; name: string; team: string; type: string;
  category: string; price: number; image_url: string;
  description: string; sizes: string[]; season: string; stock: number;
}
export interface ApiCar {
  id: string; name: string; brand: string; model: string;
  year: number; price: number; image_url: string; description: string;
  mileage: string; condition: string; fuel_type: string; transmission: string;
}
export interface ApiRealEstate {
  id: string; name: string; type: string; location: string;
  price: number; image_url: string; description: string;
  size: string; bedrooms?: number; bathrooms?: number; features: string[];
}

// Normalise Supabase snake_case → component camelCase
export function normaliseGadget(g: ApiGadget) {
  return { ...g, image: g.image_url || "/images/gadgets_phone.jpg" };
}
export function normaliseJersey(j: ApiJersey) {
  return { ...j, image: j.image_url || "/images/jerseys_shirt.jpg", size: j.sizes ?? [] };
}
export function normaliseCar(c: ApiCar) {
  return { ...c, image: c.image_url || "/images/cars_vehicle.jpg", fuelType: c.fuel_type };
}
export function normaliseRealEstate(r: ApiRealEstate) {
  return { ...r, image: r.image_url || "/images/realestate_house.jpg" };
}

type FetchState<T> = { data: T[]; loading: boolean; error: string | null; total: number };

export function useFetchProducts<T>(url: string): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({ data: [], loading: true, error: null, total: 0 });

  const fetchData = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(url, { cache: "no-store", credentials: "include" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed to fetch");
      setState({ data: json.data ?? [], loading: false, error: null, total: json.meta?.total ?? (json.data?.length ?? 0) });
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: (err as Error).message }));
    }
  }, [url]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...state, refetch: fetchData };
}

export function useFetchOne<T>(url: string): { data: T | null; loading: boolean; error: string | null } {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null, loading: true, error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch(url, { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Not found");
        if (!cancelled) setState({ data: json.data, loading: false, error: null });
      } catch (err) {
        if (!cancelled) setState({ data: null, loading: false, error: (err as Error).message });
      }
    };
    run();
    return () => { cancelled = true; };
  }, [url]);

  return state;
}
