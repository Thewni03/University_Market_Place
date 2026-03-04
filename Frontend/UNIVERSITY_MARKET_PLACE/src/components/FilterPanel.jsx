import { categories } from "../data/mockData.js";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Slider } from "./ui/slider";

function FilterContent({ selectedCategory, onCategoryChange }) {
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [rating, setRating] = useState(0);
  const [location, setLocation] = useState("all"); // "all" | "online" | "on-campus"

  return (
    <>
      {/* Category */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Category
        </p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Price Range
        </p>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={200}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Min Rating
        </p>
        <div className="flex gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRating(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                rating === r
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
              }`}
            >
              {r === 0 ? "Any" : `${r}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Location
        </p>
        <div className="flex gap-1.5">
          {["all", "online", "on-campus"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocation(l)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                location === l
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
              }`}
            >
              {l === "all" ? "All" : l}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function FilterPanel({
  open,
  onClose,
  selectedCategory,
  onCategoryChange,
  isDesktop,
}) {
  if (isDesktop) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">
            Filters
          </h3>
        </div>

        <FilterContent
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>
    );
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-bold text-foreground">
                Filters
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-secondary"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <FilterContent
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </div>
    </>
  );
}