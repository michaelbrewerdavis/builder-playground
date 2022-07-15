import _ from "lodash";

import type {
  Activity,
  Section
} from "./types";

interface Generator<T> {
  build: () => T;
}

type Builder<T> = (
  params?: any
) => Generator<T>;

interface Registry {
  getBuilder: (t: string) => any;
}

const registryStore: Record<
  string,
  any
> = {};
const registry: Registry = {
  getBuilder: (t: string) =>
    registryStore[t]
};

type Defaults<T> = Partial<
  {
    [key in keyof T]:
      | T[key]
      | (({
          self
        }: {
          self: any;
        }) => Generator<T[key]>);
  }
>;

interface BuilderConfig<T> {
  defaults: () => Defaults<T>;
}
function makeBuilder<T>(
  config: BuilderConfig<T>
): Builder<T> {
  return (params = {}) => ({
    build: () => {
      const generator = {
        ...config.defaults(),
        ...params
      };
      const scalars = _.pickBy(
        generator,
        _.negate(_.isFunction)
      );
      return _.mapValues(
        generator,
        (value: any, key: string) => {
          if (
            typeof value === "function"
          ) {
            return value({
              self: scalars
            }).build();
          }
          return value;
        }
      );
    }
  });
}

const ActivityBuilder = makeBuilder<
  Activity
>({
  defaults: () => ({
    uid: "123",
    section: ({
      self
    }: {
      self: any;
    }) =>
      (registry.getBuilder(
        "section"
      ) as Builder<Section>)({
        activity: self
      })
  })
});

registryStore[
  "activity"
] = ActivityBuilder;

const SectionBuilder = makeBuilder<
  Section
>({
  defaults: () => ({
    uid: "456",
    activity: ({
      self
    }: {
      self: any;
    }) =>
      (registry.getBuilder(
        "activity"
      ) as Builder<Activity>)({
        sections: [self]
      })
  })
});

registryStore[
  "section"
] = SectionBuilder;

const activity = ActivityBuilder().build();
console.log({ activity });
