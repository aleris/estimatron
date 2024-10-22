import { OptimizedElement } from './core/OptimizedElement'
import { OptimizedModel } from './core/OptimizedModel'
import { ModelKeys } from './core/ModelKeys'
import { ElementPicker } from './ElementPicker'

/**
 * Generates names using a prebuild model.
 */
export class Generator {
  /**
   * Creates a generator with the specified {@link OptimizedModel} model.
   * @param model the model to use
   */
  constructor(private model: OptimizedModel) { }

  /**
   * Randomly generates a new name.
   *
   * @remarks if multipleParts is true can return names like 'Abo Cordok' where the number of parts (2 in this example)
   * depends on the training data.
   *
   * @param multipleParts true to generate multiple parts names, false otherwise
   *
   * @returns a string representing a random name generated based on the model
   */
  next(multipleParts = false): string {
    const partsCount = multipleParts ? Number(this.nextToken(ModelKeys.Parts)) : 1
    const parts = []
    while (parts.length < partsCount) {
      const length = Number(this.nextToken(ModelKeys.Lengths))
      const firstCharacter = this.nextToken(ModelKeys.StartLetters)
      const characters = [firstCharacter]
      while (characters.length < length) {
        const character = this.nextToken(ModelKeys.Elements, characters)
        characters.push(character)
      }
      const rawName = characters.join('')
      const cleanedName = Generator.clean(rawName)
      const capitalizedName = Generator.capitalize(cleanedName)
      parts.push(capitalizedName)
    }
    return parts.join(' ')
  }

  private nextToken(key: string, history: string[] = []): string {
    let element = this.model[key] as OptimizedElement
    let path = Generator.tail(history, this.model[ModelKeys.NGrams] as number - 1)
    while (0 < path.length) {
      let pointerElement = Generator.atPath(element, path)
      if (undefined != pointerElement) {
        element = pointerElement
        break
      }
      path = path.slice(1, path.length)
    }
    return ElementPicker.randomPick(element)
  }

  private static atPath(root: OptimizedElement, path: string[]): OptimizedElement | undefined {
    let element = root
    for (let token of path) {
      element = element[token] as OptimizedElement
      if (element === undefined) {
        return undefined
      }
    }
    return element
  }

  private static tail(a: any[], n: number): any[] {
    if (a.length <= n) {
      return a
    }
    return a.slice(a.length - n, a.length)
  }

  private static capitalize(name: string): string {
    return name[0].toUpperCase() + name.substr(1)
  }

  private static clean(name: string) {
    if (name.match(/.+?[\-']/)) {
      return name.substr(0, name.length - 1)
    }
    return name
  }
}
