import { Composition, Folder } from "remotion";
import { BRANDS } from "./brand/theme";
import { ALL_FORMATS } from "./formats";
import { TEMPLATES, resolveDefaults } from "./templates/registry";

// Every template is registered once per platform format, so you get
// e.g. "YouTube-TitleCard", "Short-TitleCard", "FB-Reel-TitleCard", "FB-Square-TitleCard", "FB-Feed-TitleCard".
// Composition IDs: <Format>-<Template>. Add a template in templates/registry.ts.
// YouTube formats show the YouTube channel; Facebook formats show the Facebook page (src/brand/theme.ts).
export const RemotionRoot: React.FC = () => (
  <>
    {ALL_FORMATS.map((f) => (
      <Folder key={f.id} name={f.id}>
        {TEMPLATES.map((t) => {
          const defaults = resolveDefaults(t, BRANDS[f.platform]);
          return (
            <Composition
              key={t.id}
              id={`${f.id}-${t.id}`}
              component={t.component}
              schema={t.schema}
              defaultProps={defaults}
              durationInFrames={Math.round((t.duration(defaults) * f.fps) / 30)}
              fps={f.fps}
              width={f.width}
              height={f.height}
              calculateMetadata={({ props }) => ({ durationInFrames: Math.max(1, Math.round((t.duration(props) * f.fps) / 30)) })}
            />
          );
        })}
      </Folder>
    ))}
  </>
);
