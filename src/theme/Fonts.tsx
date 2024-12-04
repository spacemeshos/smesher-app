/* eslint-disable max-len */
import { Global } from '@emotion/react';

function Fonts() {
  return (
    <Global
      styles={`
      /* latin */
     	@font-face {
				font-family: 'Univers45';
				src: url('/fonts/Univers LT W01 45 Light.otf') format('opentype');
			}
			@font-face {
				font-family: 'Univers55';
				src: url('/fonts/Univers LT W01 55 Roman.otf') format('opentype');
			}
			@font-face {
				font-family: 'Univers63';
				src: url('/fonts/Univers LT W01 63 Bold Extended.otf')
					format('opentype');
			}
			@font-face {
				font-family: 'Univers65';
				src: url('/fonts/Univers LT W01 65 Bold.otf') format('opentype');
			}
			@font-face {
				font-family: 'Univers93';
				src: url('/fonts/Univers LT W01 93 X Black Ext.otf') format('opentype');
			}
      `}
    />
  );
}
export default Fonts;
