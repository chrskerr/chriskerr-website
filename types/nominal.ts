/**
 * @private
 */
interface NominalHelper<Name extends string> {
	readonly _brand: Name;
}

/**
 * Constructs a nominal type of type `BaseType`.
 * Useful to prevent any value of type `BaseType` from being used or modified in places it shouldn't (think `id`s).
 * @param BaseType the type of the `Nominal` type (string, number, etc.)
 * @param Name the name of the `Nominal` type (id, username, etc.)
 * @returns a type that is equal only to itself, but can be used like its contained type `BaseType`
 */
export type Nominal<BaseType, Name extends string> = BaseType &
	NominalHelper<Name>;
