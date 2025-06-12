import React from "react";
import { Timeline } from "@/components/ui/timeline";

export function TimelineRules() {
  const data = [
    {
      title: "1. Crée ton compte",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            👤 <b>Inscris-toi</b> ou connecte-toi pour commencer à jouer.<br />
            Accède à ton <b>profil</b> pour voir ton pseudo, ton email, tes victoires/défaites, ton image, tes decks et ton historique de parties.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/account1.webp"
              alt="account button"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="/images/account2.webp"
              alt="signup page"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="/images/account3.png"
              alt="startup template"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2. Gère tes decks",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            🃏 <b>Crée et personnalise tes decks</b> : choisis tes véhicules et upgrades, trie-les, active ou supprime des cartes.<br />
            <b>Deck actif</b> : c'est celui utilisé en course !<br />
            <b>Astuce</b> : Un bon deck, c'est la clé pour surprendre tes adversaires.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/deck1.png"
              alt="deck"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="/images/deck2.png"
              alt="deck"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="/images/deck3.png"
              alt="deck"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "3. Matchmaking & Déroulement d'une course",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            ⚡ <b>Lance une partie</b> : tu entres dans la file d'attente, un adversaire est trouvé en temps réel.<br />
            <b>Déroulement</b> : <br />
            - Choisis ton véhicule au premier tour (coût en diamants).<br />
            - À chaque tour, accélère ou freine, gère ta vitesse et ta distance.<br />
            - Les actions sont synchronisées en temps réel grâce à Pusher.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/mm1.png"
              alt="matchmaking"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
            <img
              src="/images/mm2.png"
              alt="course"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "4. Physique, virages & pénalités",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            🏎️ <b>Réaliste et stratégique</b> : la vitesse, l'accélération, le freinage et la distance sont calculés avec une vraie physique.<br />
            🚧 <b>Virages</b> : chaque circuit a des virages avec des limites de vitesse.<br />
            ⚠️ <b>Pénalités</b> : dépasse la limite et tu risques crash, malus ou immobilisation !<br />
            <b>Astuce</b> : Anticipe les virages, surveille la limite du prochain et adapte ta stratégie.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/physic.png"
              alt="physics"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "5. Upgrades & Effets",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            🛠️ <b>Utilise des upgrades</b> pour booster tes stats ou appliquer des effets temporaires.<br />
            - <b>Effets permanents</b> : restent tant que tu gardes la voiture.<br />
            - <b>Effets temporaires</b> : disparaissent au tour suivant.<br />
            <b>Astuce</b> : Change de voiture pour réinitialiser tes upgrades !
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/cards/upgrade/Amélioration_moteur_III.png"
              alt="penalty"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "6. Tours, victoire & abandon",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            🔄 <b>Fais la course sur 5 tours</b> : chaque passage de ligne est compté.<br />
            🏆 <b>Victoire</b> : sois le premier à finir 5 tours pour gagner !<br />
            🚩 <b>Abandon</b> : tu peux quitter la partie à tout moment (défaite immédiate).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/map.png"
              alt="penalty"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "7. Récompenses & économie",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            💎 <b>Gagne des diamants</b> à chaque action et à chaque tour.<br />
            💰 <b>Gagne de l'argent</b> : 1000 pour le vainqueur, 500 pour le perdant.<br />
            <b>Utilise tes gains</b> pour acheter des boosters dans la boutique.
          </p>
        </div>
      ),
    },
    {
      title: "8. Boutique & boosters",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            🛒 <b>Achetez des boosters</b> pour obtenir de nouvelles cartes (voitures ou upgrades).<br />
            - 1 booster = 1 carte aléatoire.<br />
            - Les doublons sont impossibles : tu complètes ta collection !<br />
            <b>Astuce</b> : Plus ta collection est grande, plus tu as d'options stratégiques.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/shopimg.png"
              alt="shop"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "9. Historique & profil",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 dark:text-neutral-200">
            📜 <b>Consulte ton historique</b> pour voir toutes tes parties, victoires, défaites et adversaires.<br />
            👤 <b>Personnalise ton profil</b> : pseudo, avatar, statistiques.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/images/history.png"
              alt="history"
              width={500}
              height={500}
              className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
            />
          </div>
        </div>
      ),
    },
    {
      title: "10. Quêtes & avenir",
      content: (
        <div>
          <p className="mb-6 text-sm text-neutral-800 md:text-sm dark:text-neutral-200">
            🏅 <b>Des quêtes arriveront bientôt</b> pour te permettre de gagner encore plus de récompenses.<br />
            <b>Reste connecté</b> pour ne rien manquer des nouveautés !
          </p>
        </div>
      ),
    },
  ];
  return (
    <div className="relative w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}
